import { prisma } from "@/lib/prisma";

export function getPublishedStory(slug: string) {
  return prisma.story.findFirst({ where: { slug, published: true } });
}

export function getPublishedChapter(slug: string, number: number) {
  return prisma.chapter.findFirst({
    where: {
      number,
      published: true,
      story: { slug, published: true },
    },
    include: {
      story: { select: { id: true, slug: true, title: true, coverUrl: true } },
    },
  });
}

export function getPublishedChapterList(storyId: number) {
  return prisma.chapter.findMany({
    where: { storyId, published: true },
    orderBy: { number: "asc" },
    select: { number: true, title: true },
  });
}

export async function getAdjacentChapters(storyId: number, number: number) {
  const [prev, next] = await Promise.all([
    prisma.chapter.findFirst({
      where: { storyId, published: true, number: { lt: number } },
      orderBy: { number: "desc" },
      select: { number: true },
    }),
    prisma.chapter.findFirst({
      where: { storyId, published: true, number: { gt: number } },
      orderBy: { number: "asc" },
      select: { number: true },
    }),
  ]);
  return { prev: prev?.number ?? null, next: next?.number ?? null };
}

// Hiện tại sắp theo ngày đăng. Khi có lượt xem, đổi thành sắp theo viewCount.
export function getPopularStories(limit: number) {
  return prisma.story.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, slug: true, title: true, coverUrl: true },
  });
}

export function getRelatedStories(excludeId: number, limit: number) {
  return prisma.story.findMany({
    where: { published: true, NOT: { id: excludeId } },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      slug: true,
      title: true,
      coverUrl: true,
      _count: { select: { chapters: { where: { published: true } } } },
    },
  });
}