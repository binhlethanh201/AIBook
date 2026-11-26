import { prisma } from "@/lib/prisma";
import ImportClient from "./ImportClient";

export const instant = false;

export default async function ImportPage() {
  const stories = await prisma.story.findMany({
    orderBy: { createdAt: "desc" },
    select: { title: true, slug: true, _count: { select: { chapters: true } } },
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 text-[#1A1A1A] lg:px-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[#E5DFD7] pb-6">
        <div>
          <p className="mb-2 font-mono text-[11px] tracking-[0.12em] text-[#78736D] uppercase">
            [ Excel Import ]
          </p>
          <h1 className="text-[28px] leading-tight font-medium tracking-[-0.03em]">
            Nhập truyện từ Excel
          </h1>
          <p className="mt-1.5 text-sm text-[#5C5752]">
            Tải file mẫu, điền thông tin, tải lên và kiểm tra trước khi lưu.
          </p>
        </div>

        <a
          href="/api/admin/import/template"
          className="rounded-lg border border-[#DCD5CC] bg-[#FDFBF9] px-4 py-2.5 text-sm font-medium text-[#5C5752] transition-colors hover:border-[#1A1A1A] hover:text-[#1A1A1A]"
        >
          Tải file mẫu (.xlsx)
        </a>
      </div>

      <details className="mb-6 overflow-hidden rounded-lg border border-[#DCD5CC] bg-[#FDFBF9]">
        <summary className="cursor-pointer px-4 py-3 font-mono text-[11px] tracking-wider text-[#5C5752] uppercase">
          Slug các truyện hiện có ({stories.length})
        </summary>
        <ul className="divide-y divide-[#E5DFD7] border-t border-[#E5DFD7]">
          {stories.map((s) => (
            <li key={s.slug} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
              <span className="truncate">{s.title}</span>
              <span className="shrink-0 font-mono text-xs text-[#78736D]">
                {s.slug} · {s._count.chapters} ch
              </span>
            </li>
          ))}
        </ul>
      </details>

      <ImportClient />
    </main>
  );
}
