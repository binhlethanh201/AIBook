import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export async function POST(req: Request) {
  const body = await req.json();

  const title = String(body.title ?? "").trim();
  if (!title) {
    return Response.json({ error: "Tiêu đề không được để trống" }, { status: 400 });
  }

  const description = String(body.description ?? "").trim() || null;
  const coverUrl = String(body.coverUrl ?? "").trim() || null;
  const published = Boolean(body.published);

  try {
    const story = await prisma.story.create({
      data: {
        title,
        slug: slugify(title),
        description,
        coverUrl,
        published,
      },
    });
    return Response.json(story, { status: 201 });
  } catch (err) {
    // P2002: slug đã tồn tại (trùng tiêu đề)
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return Response.json(
        { error: "Đã có truyện trùng tên, hãy đổi tiêu đề" },
        { status: 409 }
      );
    }
    throw err;
  }
}