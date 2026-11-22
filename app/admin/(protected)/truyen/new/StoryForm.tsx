"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StoryForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [published, setPublished] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, coverUrl, published }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Không thể tạo truyện");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen w-full bg-[#F9F5F1] px-6 py-10 text-[#1A1A1A] selection:bg-[#1A1A1A] selection:text-[#F9F5F1]">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex w-full max-w-2xl flex-col gap-6"
      >
        {/* Header & Breadcrumb */}
        <div className="border-b border-[#E5DFD7] pb-6">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="cursor-pointer font-mono text-[11px] tracking-wider text-[#78736D] uppercase transition-colors hover:text-[#1A1A1A]"
            >
              ← Danh sách truyện
            </button>
            <span className="font-mono text-[11px] tracking-[0.12em] text-[#78736D] uppercase">
              [ New Story ]
            </span>
          </div>

          <h1 className="text-[28px] leading-tight font-medium tracking-[-0.03em] text-[#1A1A1A]">
            Thêm truyện mới
          </h1>
        </div>

        {/* Tiêu đề */}
        <label className="flex flex-col gap-2">
          <span className="font-mono text-[11px] tracking-wider text-[#5C5752] uppercase">
            Tiêu đề *
          </span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tên truyện..."
            className="w-full rounded-lg border border-[#DCD5CC] bg-[#FDFBF9] px-3.5 py-3 text-sm text-[#1A1A1A] placeholder:text-[#B0A99F] transition-colors duration-150 outline-none hover:border-[#A39D95] focus:border-[#1A1A1A] focus:bg-white"
            required
          />
        </label>

        {/* Mô tả */}
        <label className="flex flex-col gap-2">
          <span className="font-mono text-[11px] tracking-wider text-[#5C5752] uppercase">
            Mô tả
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Tóm tắt ngắn gọn nội dung truyện..."
            className="w-full rounded-lg border border-[#DCD5CC] bg-[#FDFBF9] p-3.5 text-sm leading-relaxed text-[#1A1A1A] placeholder:text-[#B0A99F] transition-colors duration-150 outline-none hover:border-[#A39D95] focus:border-[#1A1A1A] focus:bg-white"
          />
        </label>

        {/* Link ảnh bìa */}
        <label className="flex flex-col gap-2">
          <span className="font-mono text-[11px] tracking-wider text-[#5C5752] uppercase">
            Link ảnh bìa
          </span>
          <input
            type="url"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-lg border border-[#DCD5CC] bg-[#FDFBF9] px-3.5 py-3 font-mono text-sm text-[#1A1A1A] placeholder:text-[#B0A99F] transition-colors duration-150 outline-none hover:border-[#A39D95] focus:border-[#1A1A1A] focus:bg-white"
          />
        </label>

        {/* Trạng thái công khai */}
        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-[#DCD5CC] bg-[#FDFBF9] px-4 py-3.5 transition-colors hover:border-[#A39D95]">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 cursor-pointer accent-[#1A1A1A]"
            />
            <span className="text-sm font-medium text-[#1A1A1A]">
              Hiển thị công khai
            </span>
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
            disabled={loading}
            className="cursor-pointer rounded-lg bg-[#1A1A1A] px-5 py-3 text-sm font-medium tracking-wide text-[#F9F5F1] transition-all duration-150 hover:bg-[#333333] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Đang lưu..." : "Lưu truyện"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="cursor-pointer rounded-lg border border-[#DCD5CC] bg-[#FDFBF9] px-4 py-3 text-sm font-medium text-[#5C5752] transition-colors hover:border-[#1A1A1A] hover:text-[#1A1A1A]"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}