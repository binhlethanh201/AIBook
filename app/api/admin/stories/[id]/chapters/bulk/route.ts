import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/rbac";
import { splitChapters } from "@/lib/split-chapters";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const check = await checkPermission("story:write");
  if (!("user" in check)) {
    return Response.json({ error: "Không có quyền" }, { status: check.status });
  }

  const storyId = Number((await params).id);
  if (!Number.isInteger(storyId) || storyId <= 0) {
    return Response.json({ error: "ID không hợp lệ" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const raw = typeof body?.raw === "string" ? body.raw : "";
  const { chapters, errors } = splitChapters(raw);
  if (errors.length > 0) {
    return Response.json({ error: errors.join("\n") }, { status: 400 });
  }

  // Kiểm tra số chương đã tồn tại trước khi ghi, để báo lỗi rõ ràng
  const existing = await prisma.chapter.findMany({
    where: { storyId, number: { in: chapters.map((c) => c.number) } },
    select: { number: true },
  });
  if (existing.length > 0) {
    return Response.json(
      { error: `Các chương đã tồn tại: ${existing.map((e) => e.number).join(", ")}` },
      { status: 409 }
    );
  }

  // Ghi trong một transaction: hoặc tất cả thành công, hoặc không chương nào được tạo
  await prisma.$transaction(
    chapters.map((c) =>
      prisma.chapter.create({
        data: { storyId, number: c.number, title: c.title, content: c.content, published: true },
      })
    )
  );

  return Response.json({ created: chapters.length }, { status: 201 });
}
