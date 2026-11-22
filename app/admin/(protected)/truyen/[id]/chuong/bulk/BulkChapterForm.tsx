"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { splitChapters } from "@/lib/split-chapters";

export default function BulkChapterForm({ storyId }: { storyId: number }) {
  const router = useRouter();
  const [raw, setRaw] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const preview = splitChapters(raw);
  const canSave = preview.errors.length === 0 && preview.chapters.length > 0;

  async function handleSave() {
    setError("");
    setSaving(true);
    const res = await fetch(`/api/admin/stories/${storyId}/chapters/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Không thể lưu");
      return;
    }
    router.push(`/admin/truyen/${storyId}`);
    router.refresh();
  }

  return (
    <div className="w-full bg-[#F9F5F1] px-6 py-10 text-[#1A1A1A]">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="border-b border-[#E5DFD7] pb-6">
          <p className="mb-2 font-mono text-[11px] tracking-[0.12em] text-[#78736D] uppercase">
            [ Bulk Import ]
          </p>
          <h1 className="text-[28px] leading-tight font-medium tracking-[-0.03em]">
            Đăng hàng loạt chương
          </h1>
          <p className="mt-1.5 text-sm text-[#5C5752]">
            Mỗi chương bắt đầu bằng dòng{" "}
            <span className="font-mono">=== Chương N: Tiêu đề ===</span>
          </p>
        </div>

        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={24}
          placeholder={
            "=== Chương 1: Mở đầu ===\nNội dung...\n\n=== Chương 2: Tiếp ===\nNội dung..."
          }
          className="w-full rounded-lg border border-[#DCD5CC] bg-[#FDFBF9] p-4 font-mono text-sm leading-relaxed outline-none focus:border-[#1A1A1A] focus:bg-white"
        />

        <div className="rounded-lg border border-[#DCD5CC] bg-[#FDFBF9] p-4">
          <p className="mb-3 font-mono text-[11px] tracking-wider text-[#78736D] uppercase">
            [ Xem trước ]
          </p>
          {preview.errors.length > 0 && raw.trim() && (
            <ul className="mb-3 space-y-1 text-xs text-[#B83232]">
              {preview.errors.map((e) => (
                <li key={e}>• {e}</li>
              ))}
            </ul>
          )}
          {preview.chapters.length > 0 && (
            <ul className="divide-y divide-[#E5DFD7] text-sm">
              {preview.chapters.map((c) => (
                <li key={c.number} className="flex justify-between py-2">
                  <span>
                    Chương {c.number}: {c.title}
                  </span>
                  <span className="font-mono text-xs text-[#78736D]">
                    {c.content.length.toLocaleString("vi-VN")} ký tự
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-[#D94E4E]/30 bg-[#F4E6E4] px-3.5 py-2.5 text-xs text-[#B83232] whitespace-pre-line">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 border-t border-[#E5DFD7] pt-5">
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave || saving}
            className="cursor-pointer rounded-lg bg-[#1A1A1A] px-5 py-3 text-sm font-medium text-[#F9F5F1] hover:bg-[#333333] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "Đang lưu..." : `Lưu ${preview.chapters.length} chương`}
          </button>
        </div>
      </div>
    </div>
  );
}
