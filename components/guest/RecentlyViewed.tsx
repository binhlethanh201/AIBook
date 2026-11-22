"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Stored = { slug: string; number: number };
type Item = Stored & { title: string; coverUrl: string | null };

const KEY = "recent-stories";
const MAX_ITEMS = 5;

function readStored(): Stored[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function writeStored(list: Stored[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Trình duyệt chặn localStorage thì bỏ qua
  }
}

export function RecordRead({ slug, number }: Stored) {
  useEffect(() => {
    const list = readStored();
    const next = [{ slug, number }, ...list.filter((i) => i.slug !== slug)].slice(0, MAX_ITEMS);
    writeStored(next);
  }, [slug, number]);

  return null;
}

export default function RecentlyViewed() {
  const [items, setItems] = useState<Item[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = readStored();
    let cancelled = false;

    if (stored.length === 0) {
      Promise.resolve().then(() => {
        if (!cancelled) setLoaded(true);
      });
      return () => {
        cancelled = true;
      };
    }

    fetch("/api/recent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stored),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((valid: Item[] | null) => {
        if (cancelled || !valid) return;
        writeStored(valid.map(({ slug, number }) => ({ slug, number })));
        setItems(valid);
      })
      .catch(() => {
        // Lỗi mạng: không đổi dữ liệu hiện có
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="rounded-xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 font-semibold">Đã xem gần đây</h2>
      {!loaded ? null : items.length === 0 ? (
        <p className="text-sm text-neutral-500">Bạn chưa đọc truyện nào.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((i) => (
            <li key={i.slug}>
              <Link href={`/story/${i.slug}/chapter/${i.number}`} className="block hover:underline">
                <span className="line-clamp-2 text-sm font-medium">{i.title}</span>
                <span className="text-xs text-neutral-500">Đọc tới chương {i.number}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
