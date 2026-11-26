import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StoryEditForm from "./StoryEditForm";
import ChapterList from "./ChapterList";

export const instant = false;

export default async function EditStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const story = await prisma.story.findUnique({ where: { id } });
  if (!story) notFound();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-10 text-[#1A1A1A]">
      {/* Row 1: Ảnh bìa (trái) + Form cập nhật truyện (phải) */}
      <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[240px_1fr] lg:grid-cols-[260px_1fr] lg:gap-10">
        {/* Cột trái: Khung ảnh bìa */}
        <aside className="flex flex-col gap-2.5 md:sticky md:top-20">
          <div className="flex items-center justify-between font-mono text-[11px] tracking-wider text-[#78736D] uppercase">
            <span>[ Cover ]</span>
            <span>2:3</span>
          </div>

          <div className="aspect-[2/3] w-full max-w-[240px] overflow-hidden rounded-lg border border-[#DCD5CC] bg-[#FDFBF9] md:max-w-none">
            {story.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={story.coverUrl} alt={story.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 px-4 text-center">
                <span className="font-mono text-xs tracking-wider text-[#A39D95] uppercase">
                  No Cover
                </span>
                <span className="text-xs text-[#B0A99F]">Chưa có ảnh bìa</span>
              </div>
            )}
          </div>
        </aside>

        {/* Cột phải: Form chỉnh sửa */}
        <div className="min-w-0">
          <StoryEditForm story={story} />
        </div>
      </div>

      {/* Row 2: Nhập nhiều chương + Danh sách chương */}
      <div className="flex flex-col gap-6 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#DCD5CC] bg-[#FDFBF9] px-4 py-3">
          <p className="text-sm text-[#5C5752]">
            Thêm nhiều chương cùng lúc bằng cách dán văn bản hoặc file Excel.
          </p>
          <div className="flex gap-2">
            <Link
              href={`/admin/truyen/${story.id}/chuong/bulk`}
              prefetch={false}
              className="rounded-lg border border-[#DCD5CC] px-3.5 py-2 text-xs font-medium text-[#5C5752] transition-colors hover:border-[#1A1A1A] hover:text-[#1A1A1A]"
            >
              Dán nhiều chương
            </Link>
            <Link
              href="/admin/import"
              prefetch={false}
              className="rounded-lg bg-[#1A1A1A] px-3.5 py-2 text-xs font-medium text-[#F9F5F1] transition-colors hover:bg-[#333333]"
            >
              Nhập Excel
            </Link>
          </div>
        </div>

        <ChapterList storyId={story.id} />
      </div>
    </main>
  );
}
