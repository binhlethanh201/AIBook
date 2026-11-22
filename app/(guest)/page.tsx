import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getPopularStories } from "@/lib/public";
import RecentlyViewed from "@/components/guest/RecentlyViewed";
export const instant = false;

const FEATURED_COUNT = 3;
const PAGE_SIZE = 6;

const storyCardSelect = {
  id: true,
  slug: true,
  title: true,
  coverUrl: true,
  createdAt: true,
  _count: { select: { chapters: { where: { published: true } } } },
  chapters: {
    where: { published: true },
    orderBy: { number: "desc" },
    take: 1,
    select: { number: true, createdAt: true },
  },
} as const;

type CardStory = Prisma.StoryGetPayload<{ select: typeof storyCardSelect }>;

function formatDate(date: Date) {
  return date.toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    dateStyle: "short",
    timeStyle: "short",
  });
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-6 flex items-center gap-3 text-xl font-bold uppercase">
      <span className="h-6 w-1.5 rounded bg-red-600" />
      {children}
    </h2>
  );
}

function FeaturedCard({ story, className }: { story: CardStory; className: string }) {
  return (
    <Link
      href={`/story/${story.slug}`}
      className={`group relative block overflow-hidden rounded-2xl ${className}`}
    >
      {story.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={story.coverUrl}
          alt={story.title}
          className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-neutral-300" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      <span className="absolute right-3 top-3 rounded bg-red-600 px-2.5 py-1 text-xs font-bold uppercase text-white">
        Truyện
      </span>
      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <h3 className="line-clamp-2 text-lg font-bold md:text-2xl">{story.title}</h3>
        <p className="mt-2 text-xs text-white/80">
          {story.chapters[0] ? `Chương ${story.chapters[0].number}` : "Chưa có chương"} •{" "}
          {formatDate(story.chapters[0]?.createdAt ?? story.createdAt)}
        </p>
      </div>
    </Link>
  );
}

function NewsCard({ story }: { story: CardStory }) {
  const latest = story.chapters[0];
  return (
    <Link href={`/story/${story.slug}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-neutral-200">
        {story.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={story.coverUrl}
            alt={story.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        )}
        <span className="absolute right-3 top-3 rounded bg-red-600 px-2.5 py-1 text-xs font-bold uppercase text-white">
          Truyện
        </span>
      </div>
      <h3 className="mt-4 line-clamp-2 text-lg font-bold leading-snug group-hover:underline">
        {story.title}
      </h3>
      <div className="mt-2 flex justify-between text-sm text-neutral-500">
        <span>{latest ? `Chương ${latest.number}` : "Chưa có chương"}</span>
        <span>{formatDate(latest?.createdAt ?? story.createdAt)}</span>
      </div>
    </Link>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageRaw } = await searchParams;
  const page = Math.max(1, Number(pageRaw) || 1);

  const [featured, newsStories, total, popular] = await Promise.all([
    prisma.story.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: FEATURED_COUNT,
      select: storyCardSelect,
    }),
    prisma.story.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      skip: FEATURED_COUNT + (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: storyCardSelect,
    }),
    prisma.story.count({ where: { published: true } }),
    getPopularStories(5),
  ]);

  const hasMore = FEATURED_COUNT + page * PAGE_SIZE < total;

  return (
    <main className="mx-auto max-w-6xl space-y-14 px-4 py-10">
      {total === 0 && <p className="text-neutral-500">Chưa có truyện nào.</p>}

      {featured.length > 0 && (
        <section>
          <SectionTitle>Truyện nổi bật</SectionTitle>
          <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
            <FeaturedCard story={featured[0]} className="h-[420px]" />
            <div className="grid gap-5">
              {featured.slice(1).map((s) => (
                <FeaturedCard key={s.id} story={s} className="h-[200px]" />
              ))}
            </div>
          </div>
        </section>
      )}

      {newsStories.length > 0 && (
        <section className="grid gap-10 lg:grid-cols-[1fr_340px]">
          <div>
            <SectionTitle>Truyện mới đăng</SectionTitle>
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2">
              {newsStories.map((s) => (
                <NewsCard key={s.id} story={s} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-12 flex justify-center">
                <Link
                  href={`/?page=${page + 1}`}
                  className="rounded-lg bg-red-600 px-8 py-3 font-semibold text-white hover:bg-red-700"
                >
                  Xem thêm truyện
                </Link>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <section className="rounded-xl bg-white p-5 shadow-sm">
              <h2 className="mb-4 border-b pb-3 font-bold">🔥 Đọc nhiều</h2>
              <ul className="space-y-4">
                {popular.map((s, i) => (
                  <li key={s.id}>
                    <Link href={`/story/${s.slug}`} className="group flex items-center gap-3">
                      <span className="w-4 text-center text-lg font-bold text-neutral-400">
                        {i}
                      </span>
                      {s.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={s.coverUrl}
                          alt={s.title}
                          className="h-20 w-16 flex-shrink-0 rounded object-cover"
                        />
                      ) : (
                        <div className="h-20 w-16 flex-shrink-0 rounded bg-neutral-200" />
                      )}
                      <span className="line-clamp-2 text-sm font-semibold group-hover:underline">
                        {s.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <RecentlyViewed />
          </aside>
        </section>
      )}
    </main>
  );
}
