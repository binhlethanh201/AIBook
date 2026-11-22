import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ChapterForm from "./ChapterForm";

export const instant = false;

export default async function NewChapterPage({ params }: { params: Promise<{ id: string }> }) {
  const storyId = Number((await params).id);
  if (!Number.isInteger(storyId) || storyId <= 0) notFound();

  const story = await prisma.story.findUnique({
    where: { id: storyId },
    select: { id: true, title: true },
  });
  if (!story) notFound();

  const last = await prisma.chapter.findFirst({
    where: { storyId },
    orderBy: { number: "desc" },
    select: { number: true },
  });

  const suggestedNumber = (last?.number ?? 0) + 1;

  return (
    <ChapterForm
      key={`${story.id}-${suggestedNumber}`}
      storyId={story.id}
      storyTitle={story.title}
      suggestedNumber={suggestedNumber}
    />
  );
}
