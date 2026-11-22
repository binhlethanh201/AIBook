import { prisma } from "@/lib/prisma";
import { normalizeSearch } from "@/lib/normalize";

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

export function getPopularStories(limit: number) {
  return prisma.story.findMany({
    where: { published: true },
    orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
    take: limit,
    select: {
      id: true,
      slug: true,
      title: true,
      coverUrl: true,
      viewCount: true,
    },
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

export type SearchFilters = {
  q: string;
  status?: string;
  sort?: "new" | "views" | "chapters";
};

export function searchStories(filters: SearchFilters, limit = 48) {
  const q = normalizeSearch(filters.q);

  const orderBy =
    filters.sort === "views"
      ? [{ viewCount: "desc" as const }, { createdAt: "desc" as const }]
      : filters.sort === "chapters"
        ? [{ createdAt: "desc" as const }]
        : [{ createdAt: "desc" as const }];

  return prisma.story.findMany({
    where: {
      published: true,
      ...(q ? { searchText: { contains: q } } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    },
    orderBy,
    take: limit,
    select: {
      id: true,
      slug: true,
      title: true,
      author: true,
      status: true,
      coverUrl: true,
      viewCount: true,
      createdAt: true,
      _count: { select: { chapters: { where: { published: true } } } },
    },
  });
}

// Danh sách tình trạng đang có trong database, dùng để tạo bộ lọc
export async function getStatusOptions() {
  const rows = await prisma.story.findMany({
    where: { published: true },
    distinct: ["status"],
    select: { status: true },
  });
  return rows.map((r) => r.status);
}
