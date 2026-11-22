import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StoryEditForm from "./StoryEditForm";
import ChapterList from "./ChapterList";

export const instant = false;

export default async function EditStoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const story = await prisma.story.findUnique({ where: { id } });
  if (!story) notFound();

  return (
    <>
      <StoryEditForm story={story} />
      <section className="mx-auto max-w-xl px-8 pb-12">
        <ChapterList storyId={story.id} />
      </section>
    </>
  );
}