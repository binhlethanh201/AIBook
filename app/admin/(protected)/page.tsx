import { Suspense } from "react";
import Link from "next/link";
import { adminListStories } from "@/lib/admin";
import StoryFilterBar from "./StoryFilterBar";
import StoryListClient, { type AdminStoryRow } from "./StoryListClient";

export const instant = false;

type State = "all" | "public" | "hidden";

function parseState(raw?: string): State {
  return raw === "public" || raw === "hidden" ? raw : "all";
}

async function StoryList({ q, state }: { q: string; state: State }) {
  const stories = await adminListStories({ q, state });

  if (stories.length === 0) {
    const filtered = q.trim() !== "" || state !== "all";
    return (
      <div className="rounded-lg border border-dashed border-[#DCD5CC] bg-[#FDFBF9] px-6 py-12 text-center">
        <p className="font-mono text-xs tracking-wider text-[#78736D] uppercase">
          {filtered ? "Không có truyện khớp bộ lọc." : "Chưa có truyện nào."}
        </p>
      </div>
    );
  }

  const rows: AdminStoryRow[] = stories.map((s) => ({
    id: s.id,
    title: s.title,
    published: s.published,
    viewCount: s.viewCount,
    chapters: s._count.chapters,
  }));

  // key đặt lại lựa chọn khi bộ lọc thay đổi
  return <StoryListClient key={`${q}-${state}`} stories={rows} />;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; state?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const state = parseState(sp.state);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10 text-[#1A1A1A] lg:px-10">
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

      <Suspense fallback={null}>
        <StoryFilterBar />
      </Suspense>

      <Suspense
        fallback={
          <div className="rounded-lg border border-[#DCD5CC] bg-[#FDFBF9] px-5 py-8 text-center">
            <p className="font-mono text-xs tracking-wider text-[#78736D] uppercase">
              Đang tải danh sách truyện...
            </p>
          </div>
        }
      >
        <StoryList q={q} state={state} />
      </Suspense>
    </main>
  );
}
