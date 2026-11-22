import Link from "next/link";
import { getRelatedStories } from "@/lib/public";

export default async function RelatedStories({ excludeId }: { excludeId: number }) {
  const stories = await getRelatedStories(excludeId, 6);
  if (stories.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pb-12">
      <h2 className="mb-6 border-l-4 border-red-600 pl-3 text-lg font-bold uppercase">
        Truyện khác
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stories.map((s) => (
          <Link key={s.id} href={`/truyen/${s.slug}`} className="group block">
            {s.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={s.coverUrl}
                alt={s.title}
                className="aspect-video w-full rounded-lg object-cover"
              />
            ) : (
              <div className="aspect-video w-full rounded-lg bg-neutral-200" />
            )}
            <h3 className="mt-3 font-semibold group-hover:underline">{s.title}</h3>
            <p className="text-xs text-neutral-500">{s._count.chapters} chương</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
