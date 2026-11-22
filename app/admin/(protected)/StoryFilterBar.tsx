"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

const STATES = [
  { value: "all", label: "Tất cả" },
  { value: "public", label: "Công khai" },
  { value: "hidden", label: "Ẩn" },
] as const;

export default function StoryFilterBar() {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");
  const state = params.get("state") ?? "all";

  function update(next: { q?: string; state?: string }) {
    const sp = new URLSearchParams(params.toString());
    if (next.q !== undefined) {
      if (next.q) sp.set("q", next.q);
      else sp.delete("q");
    }
    if (next.state !== undefined) {
      if (next.state !== "all") sp.set("state", next.state);
      else sp.delete("state");
    }
    startTransition(() => router.push(`/admin?${sp.toString()}`));
  }

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") update({ q });
        }}
        placeholder="Tìm theo tên truyện..."
        className="flex-1 rounded-lg border border-[#DCD5CC] bg-[#FDFBF9] px-3.5 py-2.5 text-sm outline-none transition-colors hover:border-[#A39D95] focus:border-[#1A1A1A] focus:bg-white"
      />
      <div className="flex rounded-lg border border-[#DCD5CC] bg-[#FDFBF9] p-1">
        {STATES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => update({ state: s.value })}
            className={`cursor-pointer rounded-md px-3 py-1.5 font-mono text-[11px] tracking-wider uppercase transition-colors ${
              state === s.value
                ? "bg-[#1A1A1A] text-[#F9F5F1]"
                : "text-[#5C5752] hover:text-[#1A1A1A]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      {isPending && (
        <span className="font-mono text-[11px] text-[#78736D] uppercase">Đang tải...</span>
      )}
    </div>
  );
}
