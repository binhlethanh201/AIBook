"use client";

import { useState, useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export default function ShareBar({ title }: { title: string }) {
  const url = useSyncExternalStore(
    emptySubscribe,
    () => window.location.href,
    () => ""
  );
  const [copied, setCopied] = useState(false);

  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  const links = [
    {
      label: "Facebook",
      color: "bg-blue-600",
      href: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    },
    { label: "X", color: "bg-black", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    { label: "WhatsApp", color: "bg-green-600", href: `https://wa.me/?text=${t}%20${u}` },
    { label: "Telegram", color: "bg-sky-500", href: `https://t.me/share/url?url=${u}&text=${t}` },
    { label: "Email", color: "bg-neutral-500", href: `mailto:?subject=${t}&body=${u}` },
  ];

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((l) => (
        <a
          key={l.label}
          href={url ? l.href : undefined}
          target="_blank"
          rel="noopener noreferrer"
          className={`rounded px-3 py-2 text-sm font-medium text-white ${l.color}`}
        >
          {l.label}
        </a>
      ))}
      <button
        type="button"
        onClick={copyLink}
        className="rounded bg-neutral-200 px-3 py-2 text-sm font-medium"
      >
        {copied ? "Đã sao chép" : "Sao chép link"}
      </button>
    </div>
  );
}
