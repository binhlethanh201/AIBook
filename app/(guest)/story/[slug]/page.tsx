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
      <main className="mx-auto max-w-6xl bg-white px-4 py-8 text-neutral-900">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-neutral-500 sm:text-sm">
          <Link href="/" className="transition hover:text-red-600">
            Trang chủ
          </Link>
          <span className="text-neutral-300">/</span>
          <span className="truncate text-neutral-700">{story.title}</span>
        </nav>

        {/* Thông tin chính */}
        <section className="mt-6 grid gap-8 rounded-2xl border border-neutral-200/90 bg-neutral-50/50 p-5 sm:p-7 md:grid-cols-[230px_1fr]">
          <div className="relative mx-auto w-48 sm:w-56 md:mx-0 md:w-full">
            <div className="relative overflow-hidden rounded-xl bg-neutral-100 shadow-sm">
              {story.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={story.coverUrl}
                  alt={story.title}
                  className="aspect-[3/4] w-full object-cover"
                />
              ) : (
                <div className="aspect-[3/4] w-full bg-neutral-200" />
              )}
              <span className="absolute right-2 top-2 rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-xs">
                Truyện
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-neutral-950 sm:text-3xl">
                {story.title}
              </h1>

              {story.genres.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {story.genres.map((g) => (
                    <span
                      key={g}
                      className="rounded-md border border-red-200 bg-red-50/70 px-2.5 py-1 text-xs font-semibold text-red-700"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

              <dl className="mt-5 grid max-w-lg grid-cols-[120px_1fr] gap-x-3 gap-y-2.5 rounded-xl border border-neutral-200/80 bg-white p-4 text-sm">
                <dt className="font-medium text-neutral-400">Tác giả</dt>
                <dd className="font-medium text-neutral-800">
                  {story.author ?? "Đang cập nhật"}
                </dd>

                <dt className="font-medium text-neutral-400">Tổng số chương</dt>
                <dd className="font-semibold text-neutral-900">{chapters.length}</dd>

                <dt className="font-medium text-neutral-400">Tình trạng</dt>
                <dd>
                  <span className="inline-block rounded bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-700">
                    {story.status}
                  </span>
                </dd>

                <dt className="font-medium text-neutral-400">Lượt xem</dt>
                <dd className="font-medium text-neutral-800">
                  {story.viewCount.toLocaleString("vi-VN")}
                </dd>

                <dt className="font-medium text-neutral-400">Cập nhật</dt>
                <dd className="text-neutral-600">{formatDate(updatedAt)}</dd>
              </dl>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {first && (
                <Link
                  href={`/story/${slug}/chapter/${first.number}`}
                  className="inline-flex items-center justify-center rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-red-700"
                >
                  Đọc từ đầu
                </Link>
              )}
              {latest && (
                <Link
                  href={`/story/${slug}/chapter/${latest.number}`}
                  className="inline-flex items-center justify-center rounded-lg border border-red-600 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  Đọc mới nhất
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Giới thiệu */}
        <section className="mt-10">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="h-5 w-1 rounded-full bg-red-600" aria-hidden="true" />
            <h2 className="text-lg font-extrabold uppercase tracking-wide text-neutral-950">
              Giới thiệu
            </h2>
          </div>
          <div className="rounded-xl border border-neutral-200/80 bg-white p-5">
            <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-700 sm:text-[15px]">
              {story.description ?? "Chưa có giới thiệu."}
            </p>
          </div>
        </section>

        {/* Danh sách chương */}
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="h-5 w-1 rounded-full bg-red-600" aria-hidden="true" />
              <h2 className="text-lg font-extrabold uppercase tracking-wide text-neutral-950">
                Danh sách chương
              </h2>
            </div>
            {chapters.length > 0 && (
              <span className="text-xs font-medium text-neutral-500">
                {chapters.length} chương đã xuất bản
              </span>
            )}
          </div>

          {chapters.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/60 px-5 py-10 text-center text-sm text-neutral-500">
              Truyện chưa có chương nào.
            </div>
          ) : (
            <ul className="max-h-[480px] divide-y divide-neutral-100 overflow-y-auto rounded-xl border border-neutral-200/90 bg-white">
              {chapters.map((c) => (
                <li key={c.number}>
                  <Link
                    href={`/story/${slug}/chapter/${c.number}`}
                    className="group flex items-center justify-between gap-4 px-5 py-3 text-sm transition hover:bg-neutral-50"
                  >
                    <span className="truncate font-medium text-neutral-800 transition-colors group-hover:text-red-600">
                      Chương {c.number}: {c.title}
                    </span>
                    <span className="flex-shrink-0 text-xs text-neutral-400">
                      {formatDate(c.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      {/* Truyện liên quan */}
      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-12 pt-2">
          <div className="mb-5 flex items-center gap-2.5">
            <span className="h-5 w-1 rounded-full bg-red-600" aria-hidden="true" />
            <h2 className="text-lg font-extrabold uppercase tracking-wide text-neutral-950">
              Truyện liên quan
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-6">
            {related.map((s) => (
              <Link key={s.id} href={`/story/${s.slug}`} className="group block">
                <div className="relative overflow-hidden rounded-xl bg-neutral-100 shadow-xs">
                  {s.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.coverUrl}
                      alt={s.title}
                      className="aspect-[3/4] w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="aspect-[3/4] w-full bg-neutral-200" />
                  )}
                  <span className="absolute right-1.5 top-1.5 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Truyện
                  </span>
                </div>

                <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-snug text-neutral-900 transition-colors group-hover:text-red-600">
                  {s.title}
                </h3>
                <p className="mt-1 text-xs font-medium text-neutral-500">
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