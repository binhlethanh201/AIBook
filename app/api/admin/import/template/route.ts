import { checkPermission } from "@/lib/rbac";
import { buildTemplate } from "@/lib/import/template";

export async function GET() {
  const check = await checkPermission("story:write");
  if (!("user" in check)) {
    return Response.json({ error: "Không có quyền" }, { status: check.status });
  }

  const buf = await buildTemplate();
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="template.xlsx"',
    },
  });
}
