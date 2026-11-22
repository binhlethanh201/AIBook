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
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-bold">Thêm truyện mới</h1>

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

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Đang lưu..." : "Lưu truyện"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="rounded border px-4 py-2"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}