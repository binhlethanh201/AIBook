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
    <form onSubmit={handleSave} className="mx-auto flex max-w-3xl flex-col gap-4 p-8">
      <div>
        <h1 className="text-2xl font-bold">Sửa chương</h1>
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

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving || deleting}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
        <Link href={`/admin/truyen/${storyId}`} className="rounded border px-4 py-2">
          Quay lại
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={saving || deleting}
          className="ml-auto rounded bg-red-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {deleting ? "Đang xóa..." : "Xóa chương"}
        </button>
      </div>
    </form>
  );
}