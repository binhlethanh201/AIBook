import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ChapterList({ storyId }: { storyId: number }) {
  const chapters = await prisma.chapter.findMany({
    where: { storyId },
    orderBy: { number: "asc" },
    select: { id: true, number: true, title: true, published: true },
  });

  return (
    <section className="w-full text-[#1A1A1A]">
      {/* Section Header */}
      <div className="mb-4 flex items-end justify-between border-b border-[#E5DFD7] pb-3.5">
        <div>
          <p className="mb-1 font-mono text-[11px] tracking-[0.12em] text-[#78736D] uppercase">
            [ Chapters // {String(chapters.length).padStart(2, "0")} ]
          </p>
          <h2 className="text-lg font-medium tracking-[-0.02em] text-[#1A1A1A]">
            Danh sách chương ({chapters.length})
          </h2>
        </div>

        <Link
          href={`/admin/truyen/${storyId}/chuong/new`}
          prefetch={false}
          className="rounded-lg bg-[#1A1A1A] px-3.5 py-2 text-xs font-medium tracking-wide text-[#F9F5F1] transition-all duration-150 hover:bg-[#333333] active:scale-[0.99]"
        >
          + Thêm chương
        </Link>
      </div>

      {/* Empty State vs List */}
      {chapters.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#DCD5CC] bg-[#FDFBF9] px-4 py-10 text-center">
          <p className="font-mono text-xs tracking-wider text-[#78736D] uppercase">
            Chưa có chương nào.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-[#E5DFD7] overflow-hidden rounded-lg border border-[#DCD5CC] bg-[#FDFBF9]">
          {chapters.map((c) => (
            <li
              key={c.id}
              className="group flex items-center justify-between gap-4 px-4 py-3.5 transition-colors duration-150 hover:bg-white"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="shrink-0 font-mono text-xs font-medium text-[#78736D]">
                  CH.{String(c.number).padStart(2, "0")}
                </span>
                <span className="truncate text-sm font-medium text-[#1A1A1A]">
                  Chương {c.number}: {c.title}
                </span>
                {!c.published && (
                  <span className="shrink-0 rounded border border-[#DCD5CC] bg-[#F9F5F1] px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-[#78736D] uppercase">
                    Ẩn
                  </span>
                )}
              </div>

              <Link
                href={`/admin/truyen/${storyId}/chuong/${c.id}`}
                className="shrink-0 font-mono text-xs tracking-wider text-[#5C5752] uppercase transition-colors hover:text-[#1A1A1A]"
              >
                Sửa
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}