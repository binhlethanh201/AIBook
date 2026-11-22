import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BulkChapterForm from "./BulkChapterForm";

export const instant = false;

export default async function BulkChapterPage({ params }: { params: Promise<{ id: string }> }) {
  const storyId = Number((await params).id);
  if (!Number.isInteger(storyId) || storyId <= 0) notFound();

  const story = await prisma.story.findUnique({
    where: { id: storyId },
    select: { id: true },
  });
  if (!story) notFound();

  return <BulkChapterForm storyId={story.id} />;
}
