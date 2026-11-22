import { prisma } from "@/lib/prisma";

type Input = { slug: string; number: number };

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!Array.isArray(body)) return Response.json([]);

  // Giới hạn số mục và chỉ nhận dữ liệu đúng kiểu
  const items = body
    .slice(0, 5)
    .filter(
      (i): i is Input =>
        typeof i?.slug === "string" &&
        i.slug.length <= 200 &&
        Number.isInteger(i?.number) &&
        i.number > 0
    );

  const results = await Promise.all(
    items.map(async (i) => {
      const story = await prisma.story.findFirst({
        where: { slug: i.slug, published: true },
        select: { id: true, slug: true, title: true, coverUrl: true },
      });
      if (!story) return null;

      const chapter = await prisma.chapter.findFirst({
        where: { storyId: story.id, number: i.number, published: true },
        select: { number: true },
      });
      if (!chapter) return null;

      return {
        slug: story.slug,
        title: story.title,
        coverUrl: story.coverUrl,
        number: chapter.number,
      };
    })
  );

  // Giữ nguyên thứ tự, bỏ các mục đã bị xóa hoặc ẩn
  return Response.json(results.filter((r): r is NonNullable<typeof r> => r !== null));
}
