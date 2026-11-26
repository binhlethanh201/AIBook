import { checkPermission } from "@/lib/rbac";
import { loadImportContext, parseWorkbook } from "@/lib/import/server";

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: Request) {
  const check = await checkPermission("story:write");
  if (!("user" in check)) {
    return Response.json({ error: "Không có quyền" }, { status: check.status });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Chưa chọn file" }, { status: 400 });
  }
  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    return Response.json({ error: "Chỉ nhận file .xlsx" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "File vượt quá 5 MB" }, { status: 413 });
  }

  let parsed;
  try {
    parsed = parseWorkbook(new Uint8Array(await file.arrayBuffer()));
  } catch {
    return Response.json(
      { error: "Không đọc được file. Hãy kiểm tra file có đúng định dạng .xlsx" },
      { status: 400 }
    );
  }
  if (parsed.fileError) {
    return Response.json({ error: parsed.fileError }, { status: 400 });
  }

  const db = await loadImportContext();
  return Response.json({
    stories: parsed.stories,
    chapters: parsed.chapters,
    existing: db.stories,
  });
}
