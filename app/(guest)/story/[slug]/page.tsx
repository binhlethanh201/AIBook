import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPublishedStory, getPublishedChapterList, getRelatedStories } from "@/lib/public";
import { formatDate } from "@/lib/format";

export const instant = false;

export default async function StoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = await getPublishedStory(slug);
  if (!story) notFound();

  const [chapters, related] = await Promise.all([
    prisma.chapter.findMany({
      where: { storyId: story.id, published: true },
      orderBy: { number: "desc" },
      select: { number: true, title: true, createdAt: true },
    }),
    getRelatedStories(story.id, 12),
  ]);

  const latest = chapters[0];
  const first = chapters[chapters.length - 1];
  const updatedAt = latest?.createdAt ?? story.createdAt;

  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <nav className="text-sm text-neutral-500">
          <Link href="/" className="hover:underline">Trang chủ</Link>
          <span className="mx-2">/</span>
          <span>{story.title}</span>
        </nav>

        <section className="mt-6 grid gap-8 md:grid-cols-[220px_1fr]">
          <div>
            {story.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={story.coverUrl}
                alt={story.title}
                className="w-full rounded-lg object-cover shadow-md"
              />
            ) : (
              <div className="aspect-[3/4] w-full rounded-lg bg-neutral-200" />
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold">{story.title}</h1>

            <dl className="mt-5 grid max-w-md grid-cols-[140px_1fr] gap-y-3 text-sm">
              <dt className="text-neutral-500">Tác giả</dt>
              <dd>{story.author ?? "Đang cập nhật"}</dd>
              <dt className="text-neutral-500">Tổng số chương</dt>
              <dd>{chapters.length}</dd>
              <dt className="text-neutral-500">Tình trạng</dt>
              <dd>{story.status}</dd>
              <dt className="text-neutral-500">Lượt xem</dt>
              <dd>{story.viewCount.toLocaleString("vi-VN")}</dd>
              <dt className="text-neutral-500">Cập nhật</dt>
              <dd>{formatDate(updatedAt)}</dd>
            </dl>

            {story.genres.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {story.genres.map((g) => (
                  <span key={g} className="rounded border border-orange-400 px-3 py-1 text-xs text-orange-600">
                    {g}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {first && (
                <Link
                  href={`/story/${slug}/chapter/${first.number}`}
                  className="rounded bg-green-500 px-5 py-2.5 font-semibold text-white hover:bg-green-600"
                >
                  Đọc từ đầu
                </Link>
              )}
              {latest && (
                <Link
                  href={`/story/${slug}/chapter/${latest.number}`}
                  className="rounded bg-green-500 px-5 py-2.5 font-semibold text-white hover:bg-green-600"
                >
                  Đọc mới nhất
                </Link>
              )}
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-3 font-semibold">Giới thiệu</h2>
          <p className="whitespace-pre-line leading-relaxed text-neutral-700">
            {story.description ?? "Chưa có giới thiệu."}
          </p>
        </section>

        <section className="mt-10">
          <h2 className="mb-3 font-semibold">Danh sách chương</h2>
          {chapters.length === 0 ? (
            <p className="text-neutral-500">Truyện chưa có chương nào.</p>
          ) : (
            <ul className="max-h-[480px] divide-y overflow-y-auto rounded-lg border bg-white">
              {chapters.map((c) => (
                <li key={c.number}>
                  <Link
                    href={`/story/${slug}/chapter/${c.number}`}
                    className="flex items-center justify-between px-5 py-3 text-sm hover:bg-neutral-50"
                  >
                    <span>Chương {c.number}: {c.title}</span>
                    <span className="text-xs text-neutral-400">{formatDate(c.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-12">
          <h2 className="mb-4 inline-block rounded bg-violet-500 px-4 py-2 text-sm font-semibold text-white">
            Truyện liên quan
          </h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-6">
            {related.map((s) => (
              <Link key={s.id} href={`/story/${s.slug}`} className="group block">
                {s.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.coverUrl} alt={s.title} className="aspect-[3/4] w-full rounded-lg object-cover" />
                ) : (
                  <div className="aspect-[3/4] w-full rounded-lg bg-neutral-200" />
                )}
                <h3 className="mt-2 line-clamp-1 text-sm font-medium text-orange-600 group-hover:underline">
                  {s.title}
                </h3>
                <p className="text-xs text-neutral-500">
                  {s._count.chapters} chương
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}