import { searchStories, getStatusOptions } from "@/lib/public";
import SearchClient, { type SearchResult } from "@/components/guest/SearchClient";

export const instant = false;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const status = sp.status ?? "";
  const sort = sp.sort === "views" ? "views" : "new";

  const statuses = await getStatusOptions();

  // Chỉ truy vấn khi URL đã có từ khóa, để trang trống khi mới mở
  let initialResults: SearchResult[] = [];
  if (q) {
    const rows = await searchStories({ q, status, sort });
    initialResults = rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  return (
    <main className="mx-auto max-w-6xl bg-white px-4 py-10 text-neutral-900">
      <header className="mb-8">
        <div className="flex items-center gap-2.5">
          <span className="h-5 w-1 rounded-full bg-red-600" aria-hidden="true" />
          <h1 className="text-xl font-extrabold uppercase tracking-wide text-neutral-950 sm:text-2xl">
            Tìm kiếm truyện
          </h1>
        </div>
        <p className="mt-2 pl-3.5 text-sm text-neutral-500">
          Tra cứu nhanh theo tên truyện hoặc tác giả, lọc theo tình trạng và thứ tự hiển thị.
        </p>
      </header>

      <SearchClient
        statuses={statuses}
        initialQ={q}
        initialStatus={status}
        initialSort={sort}
        initialResults={initialResults}
      />
    </main>
  );
}