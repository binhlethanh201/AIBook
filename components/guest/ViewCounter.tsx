"use client";

import { useEffect } from "react";

export default function ViewCounter({ slug }: { slug: string }) {
  useEffect(() => {
    // Gửi một lần khi trang mở. Chế độ Strict Mode của React có thể chạy hai lần khi dev,
    // nên dùng sessionStorage để không đếm trùng trong cùng một phiên.
    const key = `viewed:${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Trình duyệt chặn sessionStorage: vẫn gửi, chấp nhận đếm dư
    }

    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
      keepalive: true,
    }).catch(() => {});
  }, [slug]);

  return null;
}
