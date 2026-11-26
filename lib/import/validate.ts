import { checkContent } from "@/lib/content-check";

export type StoryDraft = {
  rowId: string;
  title: string;
  slug: string;
  description: string;
  coverUrl: string;
  author: string;
  status: string;
  genres: string[];
  published: boolean;
};

export type ChapterDraft = {
  rowId: string;
  storySlug: string;
  number: number;
  title: string;
  content: string;
  published: boolean;
};

export type ExistingStory = {
  slug: string;
  title: string;
  chapterNumbers: number[];
};

export type Validation = {
  storyIssues: Record<string, string[]>;
  chapterIssues: Record<string, string[]>;
  chapterWarnings: Record<string, string[]>;
  errorCount: number;
  warningCount: number;
};

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function push(map: Record<string, string[]>, key: string, msg: string) {
  (map[key] ??= []).push(msg);
}

export function validateDraft(
  stories: StoryDraft[],
  chapters: ChapterDraft[],
  db: { stories: ExistingStory[] }
): Validation {
  const v: Validation = {
    storyIssues: {},
    chapterIssues: {},
    chapterWarnings: {},
    errorCount: 0,
    warningCount: 0,
  };
  const err = (map: Record<string, string[]>, key: string, msg: string) => {
    push(map, key, msg);
    v.errorCount++;
  };

  const existing = new Map(db.stories.map((s) => [s.slug, new Set(s.chapterNumbers)]));
  const slugsInFile = new Set<string>();

  for (const s of stories) {
    if (!s.title) err(v.storyIssues, s.rowId, "Thiếu tiêu đề");

    if (!s.slug) {
      err(v.storyIssues, s.rowId, "Thiếu slug (không tạo được từ tiêu đề)");
    } else if (!SLUG_RE.test(s.slug)) {
      err(v.storyIssues, s.rowId, "Slug chỉ gồm chữ thường, số và dấu gạch ngang");
    } else if (existing.has(s.slug)) {
      err(v.storyIssues, s.rowId, "Slug đã tồn tại, hãy đổi tiêu đề hoặc slug");
    } else if (slugsInFile.has(s.slug)) {
      err(v.storyIssues, s.rowId, "Trùng slug với một truyện khác trong file");
    }
    slugsInFile.add(s.slug);

    if (s.coverUrl && !/^https?:\/\//i.test(s.coverUrl)) {
      err(v.storyIssues, s.rowId, "Link ảnh bìa phải bắt đầu bằng http:// hoặc https://");
    }
  }

  const chapterKeys = new Set<string>();

  for (const c of chapters) {
    if (!c.storySlug) {
      err(v.chapterIssues, c.rowId, "Thiếu story_slug");
    } else if (!slugsInFile.has(c.storySlug) && !existing.has(c.storySlug)) {
      err(v.chapterIssues, c.rowId, `Không có truyện nào có slug "${c.storySlug}"`);
    }

    if (!Number.isInteger(c.number) || c.number < 1) {
      err(v.chapterIssues, c.rowId, "Số chương phải là số nguyên dương");
    } else {
      const key = `${c.storySlug}#${c.number}`;
      if (chapterKeys.has(key)) err(v.chapterIssues, c.rowId, "Trùng số chương trong file");
      chapterKeys.add(key);
      if (existing.get(c.storySlug)?.has(c.number)) {
        err(v.chapterIssues, c.rowId, `Chương ${c.number} đã tồn tại trong truyện này`);
      }
    }

    if (!c.title) err(v.chapterIssues, c.rowId, "Thiếu tiêu đề chương");
    if (!c.content) {
      err(v.chapterIssues, c.rowId, "Thiếu nội dung chương");
    } else {
      for (const w of checkContent(c.content)) {
        push(v.chapterWarnings, c.rowId, w.message);
        v.warningCount++;
      }
    }
  }

  return v;
}

// Làm sạch dữ liệu client gửi lên trước khi ghi
export function normalizeDraft(raw: unknown): { stories: StoryDraft[]; chapters: ChapterDraft[] } {
  type Obj = Record<string, unknown>;
  const body = (raw ?? {}) as { stories?: unknown; chapters?: unknown };
  const list = (v: unknown): Obj[] =>
    (Array.isArray(v) ? v : []).slice(0, 2000).map((x) => (x ?? {}) as Obj);
  const s = (v: unknown, max: number) =>
    String(v ?? "")
      .trim()
      .slice(0, max);

  return {
    stories: list(body.stories).map((x, i) => ({
      rowId: `s${i}`,
      title: s(x.title, 200),
      slug: s(x.slug, 200),
      description: s(x.description, 5000),
      coverUrl: s(x.coverUrl, 500),
      author: s(x.author, 200),
      status: s(x.status, 50) || "Đang ra",
      genres: Array.isArray(x.genres)
        ? x.genres
            .map((g) => s(g, 50))
            .filter(Boolean)
            .slice(0, 20)
        : [],
      published: x.published === true,
    })),
    chapters: list(body.chapters).map((x, i) => ({
      rowId: `c${i}`,
      storySlug: s(x.storySlug, 200),
      number: Number(x.number),
      title: s(x.title, 200),
      content: String(x.content ?? "")
        .trim()
        .slice(0, 500_000),
      published: x.published !== false,
    })),
  };
}
