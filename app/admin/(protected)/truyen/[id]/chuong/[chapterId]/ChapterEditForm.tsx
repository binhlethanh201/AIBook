"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ChapterData = {
  id: number;
  number: number;
  title: string;
  content: string;
  published: boolean;
};

type Props = {
  storyId: number;
  storyTitle: string;
  chapter: ChapterData;
};

export default function ChapterEditForm({ storyId, storyTitle, chapter }: Props) {
  const router = useRouter();
  const [number, setNumber] = useState(String(chapter.number));
  const [title, setTitle] = useState(chapter.title);
  const [content, setContent] = useState(chapter.content);
  const [published, setPublished] = useState(chapter.published);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const res = await fetch(`/api/admin/chapters/${chapter.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number: Number(number), title, content, published }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Không thể lưu chương");
      return;
    }

    router.push(`/admin/truyen/${storyId}`);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Xóa chương ${chapter.number}: "${chapter.title}"?`)) return;

    setError("");
    setDeleting(true);

    const res = await fetch(`/api/admin/chapters/${chapter.id}`, { method: "DELETE" });

    setDeleting(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Không thể xóa chương");
      return;
    }

    router.push(`/admin/truyen/${storyId}`);
    router.refresh();
  }

  return (
    <div className="min-h-screen w-full bg-[#F9F5F1] px-6 py-10 text-[#1A1A1A] selection:bg-[#1A1A1A] selection:text-[#F9F5F1]">
      <form onSubmit={handleSave} className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        {/* Header & Breadcrumb */}
        <div className="border-b border-[#E5DFD7] pb-6">
          <div className="mb-3 flex items-center justify-between">
            <Link
              href={`/admin/truyen/${storyId}`}
              className="font-mono text-[11px] tracking-wider text-[#78736D] uppercase transition-colors hover:text-[#1A1A1A]"
            >
              ← Quay lại danh sách
            </Link>
            <span className="font-mono text-[11px] tracking-[0.12em] text-[#78736D] uppercase">
              [ Chapter Editor ]
            </span>
          </div>

          <h1 className="text-[28px] leading-tight font-medium tracking-[-0.03em] text-[#1A1A1A]">
            Sửa chương
          </h1>
          <p className="mt-1.5 text-sm text-[#5C5752]">
            Truyện: <span className="font-medium text-[#1A1A1A]">{storyTitle}</span>
          </p>
        </div>

        {/* Row 1: Số chương & Tiêu đề chương */}
        <div className="flex flex-col gap-5 sm:flex-row">
          <label className="flex w-full flex-col gap-2 sm:w-36">
            <span className="font-mono text-[11px] tracking-wider text-[#5C5752] uppercase">
              Số chương *
            </span>
            <input
              type="number"
              min={1}
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="w-full rounded-lg border border-[#DCD5CC] bg-[#FDFBF9] px-3.5 py-3 font-mono text-sm text-[#1A1A1A] placeholder:text-[#B0A99F] transition-colors duration-150 outline-none hover:border-[#A39D95] focus:border-[#1A1A1A] focus:bg-white"
              required
            />
          </label>

          <label className="flex flex-1 flex-col gap-2">
            <span className="font-mono text-[11px] tracking-wider text-[#5C5752] uppercase">
              Tiêu đề chương *
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề chương..."
              className="w-full rounded-lg border border-[#DCD5CC] bg-[#FDFBF9] px-3.5 py-3 text-sm text-[#1A1A1A] placeholder:text-[#B0A99F] transition-colors duration-150 outline-none hover:border-[#A39D95] focus:border-[#1A1A1A] focus:bg-white"
              required
            />
          </label>
        </div>

        {/* Row 2: Nội dung */}
        <label className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] tracking-wider text-[#5C5752] uppercase">
              Nội dung *
            </span>
            <span className="font-mono text-[11px] text-[#78736D]">
              {content.length.toLocaleString("vi-VN")} ký tự
            </span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            placeholder="Nội dung chương..."
            className="w-full rounded-lg border border-[#DCD5CC] bg-[#FDFBF9] p-4 text-[15px] leading-relaxed text-[#1A1A1A] placeholder:text-[#B0A99F] transition-colors duration-150 outline-none hover:border-[#A39D95] focus:border-[#1A1A1A] focus:bg-white"
            required
          />
        </label>

        {/* Row 3: Trạng thái xuất bản */}
        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-[#DCD5CC] bg-[#FDFBF9] px-4 py-3.5 transition-colors hover:border-[#A39D95]">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 cursor-pointer accent-[#1A1A1A]"
            />
            <span className="text-sm font-medium text-[#1A1A1A]">Hiển thị công khai</span>
          </div>
          <span className="font-mono text-[11px] tracking-wider text-[#78736D] uppercase">
            {published ? "PUBLIC" : "DRAFT"}
          </span>
        </label>

        {/* Error Alert */}
        {error && (
          <div className="rounded-lg border border-[#D94E4E]/30 bg-[#F4E6E4] px-3.5 py-2.5 text-xs font-medium text-[#B83232]">
            {error}
          </div>
        )}

        {/* Action Bar */}
        <div className="flex flex-wrap items-center gap-3 border-t border-[#E5DFD7] pt-5">
          <button
            type="submit"
            disabled={saving || deleting}
            className="cursor-pointer rounded-lg bg-[#1A1A1A] px-5 py-3 text-sm font-medium tracking-wide text-[#F9F5F1] transition-all duration-150 hover:bg-[#333333] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>

          <Link
            href={`/admin/truyen/${storyId}`}
            className="rounded-lg border border-[#DCD5CC] bg-[#FDFBF9] px-4 py-3 text-sm font-medium text-[#5C5752] transition-colors hover:border-[#1A1A1A] hover:text-[#1A1A1A]"
          >
            Quay lại
          </Link>

          <button
            type="button"
            onClick={handleDelete}
            disabled={saving || deleting}
            className="ml-auto cursor-pointer rounded-lg border border-[#D94E4E]/40 bg-transparent px-4 py-3 text-sm font-medium text-[#B83232] transition-colors hover:bg-[#F4E6E4] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {deleting ? "Đang xóa..." : "Xóa chương"}
          </button>
        </div>
      </form>
    </div>
  );
}
