import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function StoryList() {
  const stories = await prisma.story.findMany({
    orderBy: { createdAt: "desc" },
  });

  if (stories.length === 0) {
    return <p className="text-gray-500">Chưa có truyện nào.</p>;
  }

  return (
    <ul className="divide-y">
      {stories.map((s) => (
        <li key={s.id} className="flex items-center justify-between py-3">
          <span>
            {s.title} {!s.published && <em className="text-gray-400">(ẩn)</em>}
          </span>
          <Link href={`/admin/truyen/${s.id}`} className="text-blue-600">
            Sửa
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý truyện</h1>
        <Link href="/admin/truyen/new" className="rounded bg-black px-4 py-2 text-white">
          + Thêm truyện
        </Link>
      </div>

      <Suspense fallback={<p className="text-gray-500">Đang tải danh sách truyện...</p>}>
        <StoryList />
      </Suspense>
    </main>
  );
}