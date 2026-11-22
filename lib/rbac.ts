import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export type Role = "ADMIN" | "EDITOR";

// Thêm quyền mới ở đây khi có tính năng mới
const PERMISSIONS = {
  "story:read": ["ADMIN", "EDITOR"],
  "story:write": ["ADMIN", "EDITOR"],
  "story:delete": ["ADMIN"],
  "user:manage": ["ADMIN"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export type CurrentUser = { id: number; email: string; role: Role };

// Đọc session từ cookie rồi kiểm tra lại user trong database
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = (await cookies()).get("admin_session")?.value;
  const session = await verifySession(token);
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, role: true, active: true },
  });
  if (!user || !user.active) return null;

  return { id: user.id, email: user.email, role: user.role };
}

// Trả về user nếu có quyền, ngược lại trả về lý do lỗi để API trả đúng mã HTTP
export async function checkPermission(
  permission: Permission
): Promise<{ user: CurrentUser } | { status: 401 | 403 }> {
  const user = await getCurrentUser();
  if (!user) return { status: 401 };

  const allowed = (PERMISSIONS[permission] as readonly Role[]).includes(user.role);
  if (!allowed) return { status: 403 };

  return { user };
}
