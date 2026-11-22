import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 text-center">
        <Link href="/" className="text-2xl font-black tracking-tight">
          NOVEL
        </Link>

        <nav className="mt-5 flex flex-wrap justify-center gap-6 text-sm font-semibold text-neutral-700">
          <Link href="/contact" className="hover:underline">
            Liên hệ
          </Link>
          <Link href="/terms" className="hover:underline">
            Điều khoản sử dụng
          </Link>
          <Link href="/privacy" className="hover:underline">
            Chính sách bảo mật
          </Link>
        </nav>

        <p className="mx-auto mt-6 max-w-2xl text-xs text-neutral-500">
          Tuyên bố miễn trừ: Đây là tác phẩm hư cấu dành cho mục đích giải trí. Mọi sự trùng lặp với
          người thật, sự kiện, tổ chức hoặc địa điểm đều là ngẫu nhiên.
        </p>
      </div>
    </footer>
  );
}
