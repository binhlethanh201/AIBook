import Link from "next/link";
import { getPopularStories } from "@/lib/public";
import RecentlyViewed from "./RecentlyViewed";

type Props = {
  storySlug: string;
  storyTitle: string;
  chapters: { number: number; title: string }[];
  currentNumber: number;
};

export default async function Sidebar({ storySlug, storyTitle, chapters, currentNumber }: Props) {
  const popular = await getPopularStories(5);

  return (
    <>
      <section className="rounded-xl bg-white p-4 shadow-sm">
        <p className="mb-3 truncate text-sm font-semibold">{storyTitle}</p>
        <div className="flex justify-between border-b pb-2 text-xs font-semibold uppercase text-neutral-500">
          <span>Mục lục</span>
          <span>{chapters.length}</span>
        </div>
        <ol className="max-h-[420px] overflow-y-auto">
          {chapters.map((c) => {
            const active = c.number === currentNumber;
            return (
              <li key={c.number} className={active ? "bg-blue-50" : ""}>
                <Link
                  href={`/story/${storySlug}/chapter/${c.number}`}
                  className="flex items-center gap-3 border-b px-2 py-3 text-sm last:border-0"
                >
                  <span
                    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      active ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {String(c.number).padStart(2, "0")}
                  </span>
                  <span className={active ? "font-semibold text-blue-600" : ""}>
                    Chương {c.number}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold">Truyện nổi bật</h2>
        <ul className="space-y-3">
          {popular.map((s, i) => (
            <li key={s.id}>
              <Link href={`/story/${s.slug}`} className="flex gap-3 hover:underline">
                <span className="w-4 text-center text-sm font-bold text-neutral-400">{i}</span>
                <span className="line-clamp-2 text-sm font-medium">{s.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <RecentlyViewed />
    </>
  );
}