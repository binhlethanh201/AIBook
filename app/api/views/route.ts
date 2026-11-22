import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const slug = typeof body?.slug === "string" ? body.slug : "";
  if (!slug || slug.length > 200) {
    return Response.json({ error: "Slug không hợp lệ" }, { status: 400 });
  }

  // updateMany không báo lỗi nếu truyện không tồn tại hoặc chưa công khai
  const result = await prisma.story.updateMany({
    where: { slug, published: true },
    data: { viewCount: { increment: 1 } },
  });

  return Response.json({ ok: result.count > 0 });
}
