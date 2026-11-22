"use client";

import { useState } from "react";
import Link from "next/link";

type Props = {
  storyId: number;
  storyTitle: string;
  suggestedNumber: number;
};

export default function ChapterForm({ storyId, storyTitle, suggestedNumber }: Props) {
  const [number, setNumber] = useState(String(suggestedNumber));
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch(`/api/admin/stories/${storyId}/chapters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number: Number(number), title, content, published }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Không thể lưu chương");
      return;
    }
    window.location.href = `/admin/truyen/${storyId}`;
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl flex-col gap-4 p-8">
      <div>
        <h1 className="text-2xl font-bold">Thêm chương</h1>
        <p className="text-sm text-gray-500">Truyện: {storyTitle}</p>
      </div>

      <div className="flex gap-4">
        <label className="flex w-32 flex-col gap-1">
          <span className="text-sm font-medium">Số chương *</span>
          <input
            type="number"
            min={1}
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="rounded border p-2"
            required
          />
        </label>

        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm font-medium">Tiêu đề chương *</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded border p-2"
            required
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Nội dung *</span>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={20}
          className="rounded border p-2 leading-relaxed"
          required
        />
        <span className="text-xs text-gray-400">
          Xuống dòng bằng Enter. Đoạn văn được giữ nguyên khi hiển thị.
        </span>
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        <span className="text-sm">Hiển thị công khai</span>
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Đang lưu..." : "Lưu chương"}
        </button>
        <Link
          href={`/admin/truyen/${storyId}`}
          prefetch={false}
          className="rounded border px-4 py-2"
        >
          Hủy
        </Link>
      </div>
    </form>
  );
}