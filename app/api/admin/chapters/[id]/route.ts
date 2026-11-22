import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/rbac";

type Params = { params: Promise<{ id: string }> };

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// PUT: cập nhật chương (số, tiêu đề, nội dung, trạng thái hiển thị)
export async function PUT(req: Request, { params }: Params) {
  const id = parseId((await params).id);
  if (!id) {
    return Response.json({ error: "ID chương không hợp lệ" }, { status: 400 });
  }

  const body = await req.json();

  const number = Number(body.number);
  if (!Number.isInteger(number) || number <= 0) {
    return Response.json({ error: "Số chương phải là số nguyên dương" }, { status: 400 });
  }

  const title = String(body.title ?? "").trim();
  const content = String(body.content ?? "").trim();
  if (!title) {
    return Response.json({ error: "Tiêu đề chương không được để trống" }, { status: 400 });
  }
  if (!content) {
    return Response.json({ error: "Nội dung chương không được để trống" }, { status: 400 });
  }

  try {
    const chapter = await prisma.chapter.update({
      where: { id },
      data: {
        number,
        title,
        content,
        published: Boolean(body.published),
      },
    });
    return Response.json(chapter);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      // P2025: không tìm thấy chương
      if (err.code === "P2025") {
        return Response.json({ error: "Không tìm thấy chương" }, { status: 404 });
      }
      // P2002: đổi số chương sang số đã có trong cùng truyện
      if (err.code === "P2002") {
        return Response.json({ error: `Chương ${number} đã tồn tại` }, { status: 409 });
      }
    }
    throw err;
  }
}

// DELETE: xóa chương
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
    return Response.json({ error: "ID chương không hợp lệ" }, { status: 400 });
  }

  try {
    await prisma.chapter.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return Response.json({ error: "Không tìm thấy chương" }, { status: 404 });
    }
    throw err;
  }
}
