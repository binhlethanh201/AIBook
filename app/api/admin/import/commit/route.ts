import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/rbac";
import { normalizeSearch } from "@/lib/normalize";
import { normalizeDraft, validateDraft } from "@/lib/import/validate";
import { loadImportContext } from "@/lib/import/server";

export async function POST(req: Request) {
  const check = await checkPermission("story:write");
  if (!("user" in check)) {
    return Response.json({ error: "Không có quyền" }, { status: check.status });
  }

  const body = await req.json().catch(() => null);
  const { stories, chapters } = normalizeDraft(body);
  if (stories.length + chapters.length === 0) {
    return Response.json({ error: "Không có dữ liệu để lưu" }, { status: 400 });
  }

  // Kiểm tra lại trên server, không tin dữ liệu từ trình duyệt
  const db = await loadImportContext();
  const validation = validateDraft(stories, chapters, db);
  if (validation.errorCount > 0) {
    return Response.json(
      { error: `Còn ${validation.errorCount} lỗi, hãy sửa trước khi lưu.` },
      { status: 409 }
    );
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const idBySlug = new Map<string, number>();

        for (const s of stories) {
          const created = await tx.story.create({
            data: {
              title: s.title,
              slug: s.slug,
              description: s.description || null,
              coverUrl: s.coverUrl || null,
              author: s.author || null,
              status: s.status,
              genres: s.genres,
              published: s.published,
              searchText: normalizeSearch(s.title),
            },
            select: { id: true, slug: true },
          });
          idBySlug.set(created.slug, created.id);
        }

        // Truyện đã có sẵn (không nằm trong file)
        const missing = [...new Set(chapters.map((c) => c.storySlug))].filter(
          (slug) => !idBySlug.has(slug)
        );
        if (missing.length > 0) {
          const existing = await tx.story.findMany({
            where: { slug: { in: missing } },
            select: { id: true, slug: true },
          });
          for (const e of existing) idBySlug.set(e.slug, e.id);
        }

        const data = chapters.map((c) => {
          const storyId = idBySlug.get(c.storySlug);
          if (storyId === undefined) {
            throw new Error(`Không tìm thấy truyện cho slug ${c.storySlug}`);
          }
          return {
            storyId,
            number: c.number,
            title: c.title,
            content: c.content,
            published: c.published,
          };
        });

        const created = data.length ? await tx.chapter.createMany({ data }) : { count: 0 };

        return { storiesCreated: stories.length, chaptersCreated: created.count };
      },
      { timeout: 60_000, maxWait: 10_000 }
    );

    return Response.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return Response.json(
        { error: "Trùng dữ liệu với truyện hoặc chương đã có. Không có gì được lưu." },
        { status: 409 }
      );
    }
    throw err;
  }
}
