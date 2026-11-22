import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <details className="relative">
            <summary
              aria-label="Mở menu"
              className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded hover:bg-neutral-100"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </summary>
            <nav className="absolute left-0 mt-2 w-48 rounded-lg border bg-white p-2 shadow-lg">
              <Link href="/" className="block rounded px-3 py-2 hover:bg-neutral-100">
                Trang chủ
              </Link>
              <Link href="/search" className="block rounded px-3 py-2 hover:bg-neutral-100">
                Tìm kiếm
              </Link>
            </nav>
          </details>

          <Link href="/" className="text-3xl font-black tracking-tight">
            NOVEL
          </Link>
        </div>

        <Link
          href="/search"
          aria-label="Tìm kiếm"
          className="flex h-10 w-10 items-center justify-center rounded hover:bg-neutral-100"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
        </Link>
      </div>
    </header>
  );
}