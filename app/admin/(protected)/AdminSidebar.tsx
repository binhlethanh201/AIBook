"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  code: string;
  label: string;
  href: string;
  comingSoon?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    code: "01",
    label: "Quản lý truyện",
    href: "/admin",
  },
  {
    code: "02",
    label: "Quản lý người dùng",
    href: "/admin/users",
    comingSoon: true,
  },
  {
    code: "03",
    label: "Analytics",
    href: "/admin/analytics",
    comingSoon: true,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isItemActive(href: string) {
    if (href === "/admin") {
      return pathname === "/admin" || pathname.startsWith("/admin/truyen");
    }
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Nút mở menu trên Mobile */}
      <div className="border-b border-[#E5DFD7] bg-[#FDFBF9] px-6 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="flex w-full cursor-pointer items-center justify-between font-mono text-xs tracking-wider text-[#1A1A1A] uppercase"
        >
          <span>[ Menu điều hướng ]</span>
          <span>{mobileOpen ? "Đóng −" : "Mở +"}</span>
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          mobileOpen ? "block" : "hidden"
        } w-full shrink-0 border-b border-[#E5DFD7] bg-[#FDFBF9] lg:block lg:w-64 lg:border-r lg:border-b-0`}
      >
        <div className="flex h-full flex-col justify-between p-5 lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)]">
          <div>
            <p className="mb-3 px-2.5 font-mono text-[10px] tracking-[0.15em] text-[#78736D] uppercase">
              [ Workspace ]
            </p>

            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const active = isItemActive(item.href);

                if (item.comingSoon) {
                  return (
                    <div
                      key={item.href}
                      title="Tính năng đang phát triển"
                      className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2.5 text-sm text-[#A39D95] select-none"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[11px]">{item.code}</span>
                        <span>{item.label}</span>
                      </div>
                      <span className="rounded border border-[#E5DFD7] bg-[#F9F5F1] px-1.5 py-0.5 font-mono text-[9px] tracking-wider text-[#8C867E] uppercase">
                        Soon
                      </span>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors duration-150 ${
                      active
                        ? "bg-[#1A1A1A] font-medium text-[#F9F5F1]"
                        : "text-[#5C5752] hover:bg-[#F9F5F1] hover:text-[#1A1A1A]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-mono text-[11px] ${
                          active ? "text-[#B0A99F]" : "text-[#78736D]"
                        }`}
                      >
                        {item.code}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {active && <span className="font-mono text-[11px] text-[#F9F5F1]">→</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Ghi chú hệ thống nhỏ ở đáy sidebar */}
          <div className="mt-8 border-t border-[#E5DFD7] pt-4">
            <div className="flex items-center justify-between px-2 font-mono text-[10px] tracking-wider text-[#8C867E] uppercase">
              <span>AI-BOOK ADMIN</span>
              <span>SYS.01</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
