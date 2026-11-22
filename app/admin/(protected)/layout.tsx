import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/rbac";
import AdminSidebar from "./AdminSidebar";

export const instant = false;

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#F9F5F1] text-[#1A1A1A] selection:bg-[#1A1A1A] selection:text-[#F9F5F1]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 h-14 border-b border-[#E5DFD7] bg-[#F9F5F1]/95 backdrop-blur-xs">
        <div className="flex h-full w-full items-center justify-between px-6">
          {/* Brand Logo */}
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="inline-block h-2.5 w-2.5 bg-[#1A1A1A]" />
            <span className="font-mono text-xs font-medium tracking-[0.15em] text-[#1A1A1A] uppercase">
              ADMIN DASHBOARD
            </span>
          </Link>

          {/* Thông tin Admin & Nút đăng xuất */}
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 sm:flex">
              <span className="truncate font-mono text-xs text-[#5C5752]">{user.email}</span>
              <span className="rounded border border-[#DCD5CC] bg-[#FDFBF9] px-2 py-0.5 font-mono text-[10px] tracking-wider text-[#1A1A1A] uppercase">
                {user.role}
              </span>
            </div>

            <span className="hidden h-4 w-[1px] bg-[#E5DFD7] sm:inline-block" />

            <form action="/api/admin/logout" method="post">
              <button
                type="submit"
                className="cursor-pointer font-mono text-[11px] tracking-wider text-[#B83232] uppercase transition-opacity hover:opacity-75"
              >
                Đăng xuất
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Body: Sidebar + Main Content */}
      <div className="flex flex-1 flex-col lg:flex-row">
        <AdminSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
