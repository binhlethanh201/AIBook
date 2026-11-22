import { prisma } from "@/lib/prisma";
import { normalizeSearch } from "@/lib/normalize";

export type StoryFilter = {
  q?: string;
  state?: "all" | "public" | "hidden";
};

export function adminListStories({ q = "", state = "all" }: StoryFilter) {
  const search = normalizeSearch(q);
  return prisma.story.findMany({
    where: {
      ...(search ? { searchText: { contains: search } } : {}),
      ...(state === "public" ? { published: true } : {}),
      ...(state === "hidden" ? { published: false } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      published: true,
      viewCount: true,
      _count: { select: { chapters: true } },
    },
  });
}
