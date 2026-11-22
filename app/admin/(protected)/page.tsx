import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const instant = false;

async function StoryList() {
  const stories = await prisma.story.findMany({
    orderBy: { createdAt: "desc" },
  });

  if (stories.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[#DCD5CC] bg-[#FDFBF9] px-6 py-12 text-center">
        <p className="font-mono text-xs tracking-wider text-[#78736D] uppercase">
          Chưa có truyện nào.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-[#E5DFD7] overflow-hidden rounded-lg border border-[#DCD5CC] bg-[#FDFBF9]">
      {stories.map((s, index) => (
        <li
          key={s.id}
          className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors duration-150 hover:bg-white"
        >
          <div className="flex min-w-0 items-center gap-3.5">
            <span className="shrink-0 font-mono text-xs font-medium text-[#78736D]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="truncate text-[15px] font-medium text-[#1A1A1A]">
              {s.title}
            </span>
            {!s.published && (
              <span className="shrink-0 rounded border border-[#DCD5CC] bg-[#F9F5F1] px-2 py-0.5 font-mono text-[10px] tracking-wider text-[#78736D] uppercase">
                Ẩn
              </span>
            )}
          </div>

          <Link
            href={`/admin/truyen/${s.id}`}
            className="shrink-0 font-mono text-xs tracking-wider text-[#5C5752] uppercase transition-colors hover:text-[#1A1A1A]"
          >
            
            Sửa
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10 text-[#1A1A1A] lg:px-10">
      {/* Page Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[#E5DFD7] pb-6">
        <div>
          <p className="mb-2 font-mono text-[11px] tracking-[0.12em] text-[#78736D] uppercase">
            [ Story Directory ]
          </p>
          <h1 className="text-[28px] leading-tight font-medium tracking-[-0.03em] text-[#1A1A1A]">
            Quản lý truyện
          </h1>
        </div>

        <Link
          href="/admin/truyen/new"
          className="rounded-lg bg-[#1A1A1A] px-4 py-2.5 text-sm font-medium tracking-wide text-[#F9F5F1] transition-all duration-150 hover:bg-[#333333] active:scale-[0.99]"
        >
          + Thêm truyện
        </Link>
      </div>

      {/* Story List with Suspense */}
      <Suspense
        fallback={
          <div className="rounded-lg border border-[#DCD5CC] bg-[#FDFBF9] px-5 py-8 text-center">
            <p className="font-mono text-xs tracking-wider text-[#78736D] uppercase">
              Đang tải danh sách truyện...
            </p>
          </div>
        }
      >
        <StoryList />
      </Suspense>
    </main>
  );
}