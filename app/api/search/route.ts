import { searchStories } from "@/lib/public";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const q = (searchParams.get("q") ?? "").trim().slice(0, 100);
  if (!q) return Response.json([]);

  const status = (searchParams.get("status") ?? "").slice(0, 50);
  const sort = searchParams.get("sort") === "views" ? "views" : "new";

  const rows = await searchStories({ q, status, sort });

  // Date không gửi qua JSON được ở dạng gốc, nên chuyển sang chuỗi ISO
  return Response.json(
    rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))
  );
}