"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export type AdminStoryRow = {
  id: number;
  title: string;
  published: boolean;
  viewCount: number;
  chapters: number;
};

export default function StoryListClient({ stories }: { stories: AdminStoryRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const allChecked = stories.length > 0 && selected.size === stories.length;
  const count = selected.size;

  function toggleOne(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleAll() {
    setSelected(allChecked ? new Set() : new Set(stories.map((s) => s.id)));
  }

  async function applyPublish(isPublished: boolean) {
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/stories/bulk-publish", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [...selected], isPublished }),
    });
    setBusy(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Không thể cập nhật");
      return;
    }

    setSelected(new Set());
    router.refresh();
  }

  return (
    <div>
      {/* Thanh thao tác hàng loạt: chỉ hiện khi có truyện được chọn */}
      <div
        className={`mb-3 flex flex-wrap items-center gap-3 rounded-lg border border-[#DCD5CC] bg-[#FDFBF9] px-4 py-2.5 transition-opacity ${
          count > 0 ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={count === 0}
      >
        <span className="font-mono text-[11px] tracking-wider text-[#5C5752] uppercase">
          Đã chọn {count}
        </span>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => applyPublish(true)}
            className="cursor-pointer rounded-md bg-[#1A1A1A] px-3 py-1.5 font-mono text-[11px] tracking-wider text-[#F9F5F1] uppercase hover:bg-[#333333] disabled:opacity-40"
          >
            Công khai
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => applyPublish(false)}
            className="cursor-pointer rounded-md border border-[#DCD5CC] bg-[#F9F5F1] px-3 py-1.5 font-mono text-[11px] tracking-wider text-[#5C5752] uppercase hover:border-[#1A1A1A] hover:text-[#1A1A1A] disabled:opacity-40"
          >
            Ẩn
          </button>
        </div>
      </div>

      {error && <p className="mb-3 text-xs text-[#B83232]">{error}</p>}

      <ul className="divide-y divide-[#E5DFD7] overflow-hidden rounded-lg border border-[#DCD5CC] bg-[#FDFBF9]">
        {/* Hàng tiêu đề chọn tất cả */}
        <li className="flex items-center gap-4 bg-[#F9F5F1] px-5 py-2.5">
          <input
            type="checkbox"
            checked={allChecked}
            onChange={toggleAll}
            aria-label="Chọn tất cả"
            className="h-4 w-4 cursor-pointer accent-[#1A1A1A]"
          />
          <span className="font-mono text-[10px] tracking-wider text-[#78736D] uppercase">
            Chọn tất cả
          </span>
        </li>

        {stories.map((s) => {
          const checked = selected.has(s.id);
          return (
            <li
              key={s.id}
              className={`group flex items-center gap-4 px-5 py-4 transition-colors duration-150 hover:bg-white ${
                checked ? "bg-white" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleOne(s.id)}
                aria-label={`Chọn ${s.title}`}
                className="h-4 w-4 shrink-0 cursor-pointer accent-[#1A1A1A]"
              />

              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span
                  title={s.published ? "Công khai" : "Ẩn"}
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    s.published ? "bg-[#1A1A1A]" : "border border-[#A39D95] bg-transparent"
                  }`}
                />
                <span className="truncate text-[15px] font-medium text-[#1A1A1A]">{s.title}</span>
                <span className="shrink-0 font-mono text-[10px] tracking-wider text-[#78736D] uppercase">
                  {s.chapters} ch · {s.viewCount.toLocaleString("vi-VN")} views
                </span>
              </div>

              <Link
                href={`/admin/truyen/${s.id}`}
                className="shrink-0 font-mono text-xs tracking-wider text-[#5C5752] uppercase transition-colors hover:text-[#1A1A1A]"
              >
                Sửa
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
