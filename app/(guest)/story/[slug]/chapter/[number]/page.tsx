import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { getPublishedChapter, getPublishedChapterList, getAdjacentChapters } from "@/lib/public";
import ReaderView from "@/components/guest/ReaderView";
import ReaderNav from "@/components/guest/ReaderNav";
import ShareBar from "@/components/guest/ShareBar";
import Sidebar from "@/components/guest/Sidebar";
import RelatedStories from "@/components/guest/RelatedStories";
import { RecordRead } from "@/components/guest/RecentlyViewed";
import ViewCounter from "@/components/guest/ViewCounter";
import AdSlot from "../../../../../../components/AdSlot";

export const instant = false;

type Params = Promise<{ slug: string; number: string }>;

function parseNumber(raw: string) {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, number: raw } = await params;
  const n = parseNumber(raw);
  if (!n) return {};
  const chapter = await getPublishedChapter(slug, n);
  if (!chapter) return {};
  return {
    title: `Chương ${chapter.number}: ${chapter.title} - ${chapter.story.title}`,
  };
}

export default async function ReaderPage({ params }: { params: Params }) {
  const { slug, number: raw } = await params;
  const n = parseNumber(raw);
  if (!n) notFound();

  const chapter = await getPublishedChapter(slug, n);
  if (!chapter) notFound();

  const [chapters, adjacent] = await Promise.all([
    getPublishedChapterList(chapter.storyId),
    getAdjacentChapters(chapter.storyId, n),
  ]);

  const storyHref = `/story/${slug}`;
  const paragraphs = chapter.content
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_340px]">
        <article className="min-w-0">
          <ViewCounter slug={slug} />
          <RecordRead slug={slug} number={n} />

          <span className="inline-block border-l-4 border-red-600 pl-3 text-sm font-semibold uppercase tracking-wider text-red-600">
            Truyện
          </span>

          <h1 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
            <Link href={storyHref} className="hover:underline">
              {chapter.story.title}
            </Link>
          </h1>

          <h2 className="mt-3 text-xl font-semibold">
            Chương {n}: {chapter.title}
          </h2>

          <div className="mt-6">
            <ReaderView paragraphs={paragraphs} />
          </div>

          <div className="mt-8">
            <AdSlot id="end-of-chapter" />
          </div>

          <div className="mt-6">
            <ReaderNav prev={adjacent.prev} next={adjacent.next} storyHref={storyHref} />
          </div>

          <div className="mt-8">
            <ShareBar title={`${chapter.story.title} - Chương ${n}`} />
          </div>
        </article>

        <aside className="space-y-6">
          <Sidebar
            storySlug={slug}
            storyTitle={chapter.story.title}
            chapters={chapters}
            currentNumber={n}
          />
        </aside>
      </div>

      <RelatedStories excludeId={chapter.storyId} />
    </>
  );
}
