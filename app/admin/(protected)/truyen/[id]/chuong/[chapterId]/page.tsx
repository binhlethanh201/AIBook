import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ChapterEditForm from "./ChapterEditForm";

export const instant = false;

export default async function EditChapterPage({
  params,
}: {
  params: Promise<{ id: string; chapterId: string }>;
}) {
  const { id, chapterId } = await params;
  const storyId = Number(id);
  const chId = Number(chapterId);
  if (!Number.isInteger(storyId) || storyId <= 0) notFound();
  if (!Number.isInteger(chId) || chId <= 0) notFound();

  const chapter = await prisma.chapter.findUnique({
    where: { id: chId },
    include: { story: { select: { id: true, title: true } } },
  });

  // Chương không tồn tại, hoặc không thuộc truyện trong URL
  if (!chapter || chapter.storyId !== storyId) notFound();

  return (
    <ChapterEditForm
      storyId={chapter.story.id}
      storyTitle={chapter.story.title}
      chapter={{
        id: chapter.id,
        number: chapter.number,
        title: chapter.title,
        content: chapter.content,
        published: chapter.published,
      }}
    />
  );
}
