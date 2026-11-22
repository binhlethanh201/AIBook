import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/rbac";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="flex items-center justify-between border-b bg-white px-6 py-3 text-sm">
        <span className="text-neutral-500">
          {user.email} ({user.role})
        </span>
        <form action="/api/admin/logout" method="post">
          <button type="submit" className="text-red-600 hover:underline">
            Đăng xuất
          </button>
        </form>
      </header>
      {children}
    </div>
  );
}