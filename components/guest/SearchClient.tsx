"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/format";

export type SearchResult = {
  id: number;
  slug: string;
  title: string;
  author: string | null;
  status: string;
  coverUrl: string | null;
  viewCount: number;
  createdAt: string;
  _count: { chapters: number };
};

type Sort = "new" | "views";

type Props = {
  statuses: string[];
  initialQ: string;
  initialStatus: string;
  initialSort: Sort;
  initialResults: SearchResult[];
};

const SORTS: { value: Sort; label: string }[] = [
  { value: "new", label: "Mới đăng" },
  { value: "views", label: "Xem nhiều" },
];

function keyOf(q: string, status: string, sort: Sort) {
  return `${q}|${status}|${sort}`;
}

export default function SearchClient({
  statuses,
  initialQ,
  initialStatus,
  initialSort,
  initialResults,
}: Props) {
  const [input, setInput] = useState(initialQ);
  const [status, setStatus] = useState(initialStatus);
  const [sort, setSort] = useState<Sort>(initialSort);
  const [results, setResults] = useState<SearchResult[]>(initialResults);
  const [loading, setLoading] = useState(false);

  // Dùng trimmed làm dependency để khoảng trắng cuối không kích hoạt tìm lại
  const trimmed = input.trim();
  const lastKey = useRef(keyOf(initialQ, initialStatus, initialSort));

  useEffect(() => {
    // Đồng bộ URL để tải lại hoặc chia sẻ vẫn giữ kết quả
    const params = new URLSearchParams();
    if (trimmed) params.set("q", trimmed);
    if (status) params.set("status", status);
    if (sort !== "new") params.set("sort", sort);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `/search?${qs}` : "/search");

    const key = keyOf(trimmed, status, sort);
    if (key === lastKey.current) return;
    lastKey.current = key;

    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?${qs}`, { signal: controller.signal });
        const data: SearchResult[] = await res.json();
        setResults(data);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed, status, sort]);

  const hasQuery = trimmed.length > 0;

  return (
    <div>
      {/* Khung tìm kiếm & bộ lọc */}
      <div className="rounded-2xl border border-neutral-200/90 bg-neutral-50/70 p-4 sm:p-5">
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            autoFocus
            type="search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập tên truyện hoặc tác giả..."
            className="w-full rounded-xl border border-neutral-200 bg-white py-3.5 pl-11 pr-4 text-base text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-600/15"
          />
        </div>

        {/* Bộ lọc */}
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              aria-label="Tình trạng truyện"
              className="rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm font-medium text-neutral-700 outline-none transition hover:border-neutral-300 focus:border-red-600"
            >
              <option value="">Tất cả tình trạng</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select> */}

            <div
              className="inline-flex rounded-lg border border-neutral-200 bg-white p-0.5 text-sm"
              role="group"
              aria-label="Sắp xếp kết quả"
            >
              {SORTS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setSort(o.value)}
                  className={`rounded-md px-3.5 py-1.5 font-medium transition ${
                    sort === o.value
                      ? "bg-red-600 text-white shadow-xs"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Trạng thái kết quả */}
          <p className="text-xs font-medium text-neutral-500 sm:text-sm">
            {!hasQuery && "Nhập từ khóa để bắt đầu tìm kiếm."}
            {hasQuery && loading && "Đang tìm kiếm..."}
            {hasQuery && !loading && (
              <>
                Tìm thấy <span className="font-semibold text-neutral-900">{results.length}</span>{" "}
                truyện cho <span className="font-semibold text-red-600">&ldquo;{trimmed}&rdquo;</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Kết quả: chỉ hiện khi đã nhập từ khóa */}
      {hasQuery && !loading && results.length === 0 && (
        <div className="mt-14 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 px-6 py-14 text-center">
          <p className="text-base font-semibold text-neutral-800">
            Không tìm thấy truyện nào phù hợp
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Thử lại với từ khóa khác hoặc thay đổi bộ lọc tình trạng.
          </p>
        </div>
      )}

      {hasQuery && results.length > 0 && (
        <ul
          className={`mt-6 grid gap-5 transition-opacity duration-200 sm:grid-cols-2 lg:grid-cols-3 ${
            loading ? "opacity-50" : "opacity-100"
          }`}
        >
          {results.map((s) => (
            <li key={s.id}>
              <Link
                href={`/story/${s.slug}`}
                className="group flex h-full gap-4 rounded-xl border border-neutral-200/90 bg-white p-3.5 transition duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md"
              >
                {/* Ảnh bìa + Badge đỏ góc trên phải giống phong cách ảnh */}
                <div className="relative h-32 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                  {s.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.coverUrl}
                      alt={s.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-neutral-200 text-xs font-medium text-neutral-400">
                      No Cover
                    </div>
                  )}
                  <span className="absolute right-1.5 top-1.5 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-xs">
                    Truyện
                  </span>
                </div>

                {/* Nội dung thẻ */}
                <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                  <div>
                    <h2 className="line-clamp-2 text-sm font-bold leading-snug text-neutral-900 transition-colors group-hover:text-red-600 sm:text-[15px]">
                      {s.title}
                    </h2>

                    <p className="mt-1.5 truncate text-xs text-neutral-500">
                      {s.author ?? "Đang cập nhật"}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="rounded bg-neutral-100 px-2 py-0.5 font-medium text-neutral-700">
                        {s.status}
                      </span>
                      <span className="text-neutral-400">•</span>
                      <span className="text-neutral-500">
                        {s.viewCount.toLocaleString("vi-VN")} lượt xem
                      </span>
                    </div>
                  </div>

                  {/* Dòng thông tin chương & ngày đăng tương tự meta dưới thẻ trong ảnh */}
                  <p className="mt-2.5 truncate text-xs font-medium text-neutral-500">
                    Chương {s._count.chapters} • {formatDate(new Date(s.createdAt))}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}