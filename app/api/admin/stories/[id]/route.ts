import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/rbac";

type Params = { params: Promise<{ id: string }> };

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// PUT: cập nhật thông tin truyện
export async function PUT(req: Request, { params }: Params) {
  const id = parseId((await params).id);
  if (!id) {
    return Response.json({ error: "ID không hợp lệ" }, { status: 400 });
  }

  const body = await req.json();

  const title = String(body.title ?? "").trim();
  if (!title) {
    return Response.json({ error: "Tiêu đề không được để trống" }, { status: 400 });
  }

  try {
    // Không cập nhật slug để giữ nguyên URL cũ, tránh mất SEO
    const story = await prisma.story.update({
      where: { id },
      data: {
        title,
        description: String(body.description ?? "").trim() || null,
        coverUrl: String(body.coverUrl ?? "").trim() || null,
        published: Boolean(body.published),
      },
    });
    return Response.json(story);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return Response.json({ error: "Không tìm thấy truyện" }, { status: 404 });
    }
    throw err;
  }
}

// DELETE: xóa truyện, các chương sẽ bị xóa theo (onDelete: Cascade trong schema)
export async function DELETE(_req: Request, { params }: Params) {
  const check = await checkPermission("story:delete");
  if (!("user" in check)) {
    return Response.json(
      { error: check.status === 401 ? "Chưa đăng nhập" : "Không có quyền xóa" },
      { status: check.status }
    );
  }
  const id = parseId((await params).id);
  if (!id) {
    return Response.json({ error: "ID không hợp lệ" }, { status: 400 });
  }

  try {
    await prisma.story.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return Response.json({ error: "Không tìm thấy truyện" }, { status: 404 });
    }
    throw err;
  }
}