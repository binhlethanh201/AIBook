"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Story } from "@prisma/client";

export default function StoryEditForm({ story }: { story: Story }) {
  const router = useRouter();
  const [title, setTitle] = useState(story.title);
  const [description, setDescription] = useState(story.description ?? "");
  const [coverUrl, setCoverUrl] = useState(story.coverUrl ?? "");
  const [published, setPublished] = useState(story.published);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const res = await fetch(`/api/admin/stories/${story.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, coverUrl, published }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Không thể lưu truyện");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Xóa truyện "${story.title}" và toàn bộ chương của truyện?`)) return;

    setError("");
    setDeleting(true);

    const res = await fetch(`/api/admin/stories/${story.id}`, { method: "DELETE" });

    setDeleting(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Không thể xóa truyện");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="mx-auto flex max-w-xl flex-col gap-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sửa truyện</h1>
        <span className="text-sm text-gray-500">Slug: /truyen/{story.slug}</span>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Tiêu đề *</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded border p-2"
          required
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Mô tả</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="rounded border p-2"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Link ảnh bìa</span>
        <input
          type="url"
          value={coverUrl}
          onChange={(e) => setCoverUrl(e.target.value)}
          placeholder="https://..."
          className="rounded border p-2"
        />
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        <span className="text-sm">Hiển thị công khai (guest có thể thấy)</span>
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
        <Link href="/admin" className="rounded border px-4 py-2">
          Quay lại
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={saving || deleting}
          className="ml-auto rounded bg-red-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {deleting ? "Đang xóa..." : "Xóa truyện"}
        </button>
      </div>
    </form>
  );
}