"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Issue = { level: "error" | "warn"; message: string };

type Props = {
  chapterLabel: string;
  issues: Issue[];
  editHref: string;
};

export default function ChapterWarningBadge({ chapterLabel, issues, editHref }: Props) {
  const [open, setOpen] = useState(false);

  // Đóng bằng phím Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 cursor-pointer rounded border border-[#E5C98A] bg-[#FBF5E6] px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-[#8A6A1F] uppercase transition-colors hover:bg-[#F5E9C8]"
      >
        {issues.length} cảnh báo
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="warning-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-lg border border-[#DCD5CC] bg-[#F9F5F1] p-6 text-[#1A1A1A] shadow-xl"
          >
            <p className="mb-2 font-mono text-[11px] tracking-[0.12em] text-[#78736D] uppercase">
              [ Content Check ]
            </p>
            <h2 id="warning-title" className="text-lg font-medium tracking-[-0.02em]">
              {chapterLabel}
            </h2>
            <p className="mt-1 text-sm text-[#5C5752]">
              Chương này có {issues.length} vấn đề cần xem lại trước khi công khai.
            </p>

            <ul className="mt-5 space-y-3">
              {issues.map((issue, i) => (
                <li
                  key={i}
                  className="flex gap-3 rounded-lg border border-[#E5C98A] bg-[#FBF5E6] px-3.5 py-3"
                >
                  <span className="mt-0.5 shrink-0 font-mono text-[10px] tracking-wider text-[#8A6A1F] uppercase">
                    {issue.level === "error" ? "Lỗi" : "Cảnh báo"}
                  </span>
                  <span className="text-sm leading-relaxed text-[#1A1A1A]">{issue.message}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-[#E5DFD7] pt-5">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="cursor-pointer rounded-lg border border-[#DCD5CC] bg-[#FDFBF9] px-4 py-2.5 text-sm font-medium text-[#5C5752] transition-colors hover:border-[#1A1A1A] hover:text-[#1A1A1A]"
              >
                Đóng
              </button>
              <Link
                href={editHref}
                className="rounded-lg bg-[#1A1A1A] px-4 py-2.5 text-sm font-medium text-[#F9F5F1] transition-colors hover:bg-[#333333]"
              >
                Sửa chương
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
