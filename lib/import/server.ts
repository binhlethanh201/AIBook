import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import type { ChapterDraft, ExistingStory, StoryDraft } from "@/lib/import/validate";
import { EXAMPLES, HEADER_ROW, END_MARKER } from "@/lib/import/template";

const str = (v: unknown) => (v == null ? "" : String(v).trim());
const TRUE_WORDS = new Set(["true", "1", "yes", "y", "x", "có", "co"]);
const bool = (v: unknown, fallback: boolean) => {
  const s = str(v).toLowerCase();
  return s === "" ? fallback : TRUE_WORDS.has(s);
};
const norm = (k: string) => k.trim().toLowerCase().replace(/\s+/g, "_");

type Raw = Record<string, unknown>;

// Đọc bảng bắt đầu từ hàng tiêu đề, dừng khi gặp dòng "▼ QUY TẮC NHẬP LIỆU"
function readTable(ws: XLSX.WorkSheet | undefined, sheet: "Truyen" | "Chuong"): Raw[] {
  if (!ws) return [];

  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, {
    header: 1,
    defval: "",
    blankrows: true,
  });

  const headers = (rows[HEADER_ROW - 1] ?? []).map((h) => norm(str(h)));
  const example = EXAMPLES[sheet].map((v) => str(v).toLowerCase()).join("|");
  const out: Raw[] = [];

  for (let i = HEADER_ROW; i < rows.length; i++) {
    const row = rows[i] ?? [];
    if (str(row[0]).startsWith("▼")) break;

    const values = headers.map((_, j) => row[j] ?? "");
    const key = values.map((v) => str(v).toLowerCase()).join("|");

    // Bỏ dòng trống và dòng ví dụ
    if (key.replace(/\|/g, "") === "" || key === example) continue;

    out.push(Object.fromEntries(headers.map((h, j) => [h, values[j]])));
  }

  return out;
}

export type ParseResult = {
  stories: StoryDraft[];
  chapters: ChapterDraft[];
  fileError?: string;
};

export function parseWorkbook(bytes: Uint8Array): ParseResult {
  const wb = XLSX.read(bytes, { type: "array" });
  const storySheet = wb.Sheets["Truyen"];
  const chapterSheet = wb.Sheets["Chuong"];

  if (!storySheet && !chapterSheet) {
    return {
      stories: [],
      chapters: [],
      fileError: "File không có sheet 'Truyen' hoặc 'Chuong'. Hãy tải file mẫu và điền vào đó.",
    };
  }

  const stories: StoryDraft[] = readTable(storySheet, "Truyen").map((r, i) => {
    const title = str(r.title);
    return {
      rowId: `s${i}`,
      title,
      slug: str(r.slug) || slugify(title),
      description: str(r.description),
      coverUrl: str(r.cover_url),
      author: str(r.author),
      status: str(r.status) || "Đang ra",
      genres: str(r.genres)
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean),
      published: bool(r.published, true),
    };
  });

  const chapters: ChapterDraft[] = readTable(chapterSheet, "Chuong").map((r, i) => ({
    rowId: `c${i}`,
    storySlug: str(r.story_slug),
    number: Number(str(r.number)),
    title: str(r.title),
    content: str(r.content),
    published: bool(r.published, true),
  }));

  if (stories.length + chapters.length > 2000) {
    return { stories: [], chapters: [], fileError: "File vượt quá 2000 dòng mỗi sheet." };
  }

  return { stories, chapters };
}

export async function loadImportContext(): Promise<{ stories: ExistingStory[] }> {
  const rows = await prisma.story.findMany({
    select: {
      slug: true,
      title: true,
      chapters: { select: { number: true } },
    },
  });
  return {
    stories: rows.map((r) => ({
      slug: r.slug,
      title: r.title,
      chapterNumbers: r.chapters.map((c) => c.number),
    })),
  };
}
