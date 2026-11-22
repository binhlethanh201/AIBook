import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/rbac";

export async function PATCH(req: Request) {
  const check = await checkPermission("story:write");
  if (!("user" in check)) {
    return Response.json({ error: "Không có quyền" }, { status: check.status });
  }

  const body = await req.json().catch(() => null);
  const ids: unknown[] = Array.isArray(body?.ids) ? body.ids : [];
  const isPublished = body?.isPublished;

  if (typeof isPublished !== "boolean") {
    return Response.json({ error: "Thiếu trường isPublished" }, { status: 400 });
  }

  const validIds = ids.filter((id): id is number => Number.isInteger(id) && (id as number) > 0);
  if (validIds.length === 0 || validIds.length > 200) {
    return Response.json({ error: "Danh sách id không hợp lệ" }, { status: 400 });
  }

  const result = await prisma.story.updateMany({
    where: { id: { in: validIds } },
    data: { published: isPublished },
  });

  return Response.json({ updated: result.count });
}
