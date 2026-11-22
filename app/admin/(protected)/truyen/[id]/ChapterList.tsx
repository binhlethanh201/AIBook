import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ChapterList({ storyId }: { storyId: number }) {
  const chapters = await prisma.chapter.findMany({
    where: { storyId },
    orderBy: { number: "asc" },
    select: { id: true, number: true, title: true, published: true },
  });

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Danh sách chương ({chapters.length})
        </h2>
        <Link
          href={`/admin/truyen/${storyId}/chuong/new`}
          prefetch={false}
          className="rounded bg-black px-3 py-1.5 text-sm text-white"
        >
          + Thêm chương
        </Link>
      </div>

      {chapters.length === 0 ? (
        <p className="text-gray-500">Chưa có chương nào.</p>
      ) : (
        <ul className="divide-y rounded border">
          {chapters.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between px-4 py-2"
            >
              <span>
                Chương {c.number}: {c.title}
                {!c.published && <em className="ml-2 text-gray-400">(ẩn)</em>}
              </span>
              <Link
                href={`/admin/truyen/${storyId}/chuong/${c.id}`}
                className="text-sm text-blue-600"
              >
                Sửa
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
