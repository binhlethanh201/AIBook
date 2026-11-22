import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const storyId = Number((await params).id);
  if (!Number.isInteger(storyId) || storyId <= 0) {
    return Response.json({ error: "ID truyện không hợp lệ" }, { status: 400 });
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
    const chapter = await prisma.chapter.create({
      data: {
        storyId,
        number,
        title,
        content,
        published: Boolean(body.published),
      },
    });
    return Response.json(chapter, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002: đã có chương với số này trong truyện
      if (err.code === "P2002") {
        return Response.json({ error: `Chương ${number} đã tồn tại` }, { status: 409 });
      }
      // P2003: storyId không tồn tại
      if (err.code === "P2003") {
        return Response.json({ error: "Không tìm thấy truyện" }, { status: 404 });
      }
    }
    throw err;
  }
}
