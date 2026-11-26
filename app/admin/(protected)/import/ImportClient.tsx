"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  validateDraft,
  type ChapterDraft,
  type ExistingStory,
  type StoryDraft,
} from "@/lib/import/validate";

type Notice = { type: "ok" | "error"; text: string } | null;

const INPUT =
  "w-full rounded-lg border border-[#DCD5CC] bg-[#FDFBF9] px-3 py-2 text-sm text-[#1A1A1A] outline-none transition-colors hover:border-[#A39D95] focus:border-[#1A1A1A] focus:bg-white";
const LABEL = "mb-1 block font-mono text-[10px] tracking-wider text-[#78736D] uppercase";
const BTN_PRIMARY =
  "cursor-pointer rounded-lg bg-[#1A1A1A] px-4 py-2.5 text-sm font-medium text-[#F9F5F1] transition-colors hover:bg-[#333333] disabled:cursor-not-allowed disabled:opacity-40";
const BTN_GHOST =
  "cursor-pointer rounded-md border border-[#DCD5CC] bg-[#FDFBF9] px-2.5 py-1.5 font-mono text-[10px] tracking-wider text-[#5C5752] uppercase transition-colors hover:border-[#1A1A1A] hover:text-[#1A1A1A]";

export default function ImportClient() {
  const router = useRouter();
  const [stories, setStories] = useState<StoryDraft[]>([]);
  const [chapters, setChapters] = useState<ChapterDraft[]>([]);
  const [existing, setExisting] = useState<ExistingStory[]>([]);
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  // Kiểm tra lại mỗi khi admin sửa bất kỳ ô nào
  const validation = useMemo(
    () => validateDraft(stories, chapters, { stories: existing }),
    [stories, chapters, existing]
  );
  const hasDraft = stories.length + chapters.length > 0;

  const slugOptions = useMemo(
    () =>
      [...new Set([...existing.map((e) => e.slug), ...stories.map((s) => s.slug)])].filter(Boolean),
    [existing, stories]
  );

  async function handleFile(file: File) {
    setBusy(true);
    setNotice(null);

    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/import/parse", { method: "POST", body: form });
    const data = await res.json().catch(() => null);
    setBusy(false);

    if (!res.ok) {
      setNotice({ type: "error", text: data?.error ?? "Không đọc được file" });
      return;
    }

    setFileName(file.name);
    setStories(data.stories);
    setChapters(data.chapters);
    setExisting(data.existing);
    setNotice({
      type: "ok",
      text: `Đã đọc ${data.stories.length} truyện và ${data.chapters.length} chương từ "${file.name}". Kiểm tra và sửa bên dưới trước khi lưu.`,
    });
  }

  function patchStory(rowId: string, patch: Partial<StoryDraft>) {
    setStories((prev) => prev.map((s) => (s.rowId === rowId ? { ...s, ...patch } : s)));
  }
  function patchChapter(rowId: string, patch: Partial<ChapterDraft>) {
    setChapters((prev) => prev.map((c) => (c.rowId === rowId ? { ...c, ...patch } : c)));
  }
  function removeStory(rowId: string) {
    setStories((prev) => prev.filter((s) => s.rowId !== rowId));
  }
  function removeChapter(rowId: string) {
    setChapters((prev) => prev.filter((c) => c.rowId !== rowId));
  }

  async function handleCommit() {
    if (validation.errorCount > 0) return;
    setBusy(true);
    setNotice(null);

    const res = await fetch("/api/admin/import/commit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stories, chapters }),
    });
    const data = await res.json().catch(() => null);
    setBusy(false);

    if (!res.ok) {
      setNotice({
        type: "error",
        text: data?.error ?? "Lưu thất bại. Chưa có dữ liệu nào được ghi.",
      });
      return;
    }

    setNotice({
      type: "ok",
      text: `Đã lưu ${data.storiesCreated} truyện và ${data.chaptersCreated} chương.`,
    });
    setStories([]);
    setChapters([]);
    setExisting([]);
    setFileName("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Bước 1: tải file */}
      <section className="rounded-lg border border-[#DCD5CC] bg-[#FDFBF9] p-5">
        <p className="mb-3 font-mono text-[11px] tracking-[0.12em] text-[#78736D] uppercase">
          [ 01 · Tải file lên ]
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept=".xlsx"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
            className="text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border file:border-[#DCD5CC] file:bg-[#F9F5F1] file:px-3 file:py-1.5 file:text-xs"
          />
          {fileName && <span className="font-mono text-xs text-[#78736D]">{fileName}</span>}
          {busy && (
            <span className="font-mono text-[11px] tracking-wider text-[#78736D] uppercase">
              Đang xử lý...
            </span>
          )}
        </div>
      </section>

      {notice && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            notice.type === "ok"
              ? "border-[#B9D3B0] bg-[#EEF6EA] text-[#2F5A24]"
              : "border-[#D94E4E]/30 bg-[#F4E6E4] text-[#B83232]"
          }`}
        >
          {notice.text}
        </div>
      )}

      {hasDraft && (
        <>
          {/* Tổng quan và nút lưu */}
          <section className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#DCD5CC] bg-[#FDFBF9] px-5 py-4">
            <div className="flex flex-wrap gap-6 font-mono text-xs">
              <Stat label="Truyện" value={stories.length} />
              <Stat label="Chương" value={chapters.length} />
              <Stat
                label="Lỗi"
                value={validation.errorCount}
                tone={validation.errorCount > 0 ? "error" : "ok"}
              />
              <Stat label="Cảnh báo" value={validation.warningCount} tone="warn" />
            </div>
            <button
              type="button"
              onClick={handleCommit}
              disabled={busy || validation.errorCount > 0}
              className={BTN_PRIMARY}
            >
              {busy ? "Đang lưu..." : "Lưu tất cả"}
            </button>
          </section>

          {/* Danh sách truyện mới */}
          {stories.length > 0 && (
            <section className="flex flex-col gap-3">
              <p className="font-mono text-[11px] tracking-[0.12em] text-[#78736D] uppercase">
                [ Truyện mới // {stories.length} ]
              </p>
              {stories.map((s) => (
                <StoryCard
                  key={s.rowId}
                  story={s}
                  issues={validation.storyIssues[s.rowId] ?? []}
                  onChange={(p) => patchStory(s.rowId, p)}
                  onRemove={() => removeStory(s.rowId)}
                />
              ))}
            </section>
          )}

          {/* Danh sách chương */}
          {chapters.length > 0 && (
            <section className="flex flex-col gap-3">
              <datalist id="import-slugs">
                {slugOptions.map((o) => (
                  <option key={o} value={o} />
                ))}
              </datalist>
              <p className="font-mono text-[11px] tracking-[0.12em] text-[#78736D] uppercase">
                [ Chương // {chapters.length} ]
              </p>
              {chapters.map((c) => (
                <ChapterCard
                  key={c.rowId}
                  chapter={c}
                  errors={validation.chapterIssues[c.rowId] ?? []}
                  warnings={validation.chapterWarnings[c.rowId] ?? []}
                  onChange={(p) => patchChapter(c.rowId, p)}
                  onRemove={() => removeChapter(c.rowId)}
                />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "ok" | "error" | "warn";
}) {
  const color =
    tone === "error" ? "text-[#B83232]" : tone === "warn" ? "text-[#8A6A1F]" : "text-[#1A1A1A]";
  return (
    <div>
      <p className="text-[10px] tracking-wider text-[#78736D] uppercase">{label}</p>
      <p className={`text-lg font-medium ${color}`}>{value}</p>
    </div>
  );
}

function IssueList({ errors, warnings }: { errors: string[]; warnings: string[] }) {
  if (errors.length === 0 && warnings.length === 0) return null;
  return (
    <ul className="mt-3 space-y-1">
      {errors.map((e) => (
        <li key={e} className="text-xs text-[#B83232]">
          • Lỗi: {e}
        </li>
      ))}
      {warnings.map((w) => (
        <li key={w} className="text-xs text-[#8A6A1F]">
          • Cảnh báo: {w}
        </li>
      ))}
    </ul>
  );
}

function StoryCard({
  story,
  issues,
  onChange,
  onRemove,
}: {
  story: StoryDraft;
  issues: string[];
  onChange: (p: Partial<StoryDraft>) => void;
  onRemove: () => void;
}) {
  // Giữ chuỗi thể loại đang gõ riêng, tránh mất dấu phẩy khi đang nhập
  const [genreText, setGenreText] = useState(story.genres.join(", "));

  return (
    <div
      className={`rounded-lg border bg-[#FDFBF9] p-4 ${
        issues.length > 0 ? "border-[#D94E4E]/50" : "border-[#DCD5CC]"
      }`}
    >
      <div className="flex gap-4">
        <div className="h-32 w-24 shrink-0 overflow-hidden rounded border border-[#DCD5CC] bg-[#F9F5F1]">
          {story.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={story.coverUrl} alt="" className="h-full w-full object-cover" />
          )}
        </div>

        <div className="grid flex-1 gap-3 md:grid-cols-2">
          <label>
            <span className={LABEL}>Tiêu đề</span>
            <input
              className={INPUT}
              value={story.title}
              onChange={(e) => onChange({ title: e.target.value })}
            />
          </label>
          <label>
            <span className={LABEL}>Slug</span>
            <input
              className={`${INPUT} font-mono`}
              value={story.slug}
              onChange={(e) => onChange({ slug: e.target.value })}
            />
          </label>
          <label>
            <span className={LABEL}>Tác giả</span>
            <input
              className={INPUT}
              value={story.author}
              onChange={(e) => onChange({ author: e.target.value })}
            />
          </label>
          <label>
            <span className={LABEL}>Tình trạng</span>
            <input
              className={INPUT}
              value={story.status}
              onChange={(e) => onChange({ status: e.target.value })}
            />
          </label>
          <label>
            <span className={LABEL}>Thể loại (cách nhau dấu phẩy)</span>
            <input
              className={INPUT}
              value={genreText}
              onChange={(e) => {
                setGenreText(e.target.value);
                onChange({
                  genres: e.target.value
                    .split(",")
                    .map((g) => g.trim())
                    .filter(Boolean),
                });
              }}
            />
          </label>
          <label>
            <span className={LABEL}>Link ảnh bìa</span>
            <input
              className={`${INPUT} font-mono`}
              value={story.coverUrl}
              onChange={(e) => onChange({ coverUrl: e.target.value })}
            />
          </label>
          <label className="md:col-span-2">
            <span className={LABEL}>Mô tả</span>
            <textarea
              rows={2}
              className={INPUT}
              value={story.description}
              onChange={(e) => onChange({ description: e.target.value })}
            />
          </label>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={story.published}
            onChange={(e) => onChange({ published: e.target.checked })}
            className="h-4 w-4 accent-[#1A1A1A]"
          />
          Hiển thị công khai
        </label>
        <button type="button" onClick={onRemove} className={BTN_GHOST}>
          Bỏ dòng này
        </button>
      </div>

      <IssueList errors={issues} warnings={[]} />
    </div>
  );
}

function ChapterCard({
  chapter,
  errors,
  warnings,
  onChange,
  onRemove,
}: {
  chapter: ChapterDraft;
  errors: string[];
  warnings: string[];
  onChange: (p: Partial<ChapterDraft>) => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={`rounded-lg border bg-[#FDFBF9] p-4 ${
        errors.length > 0 ? "border-[#D94E4E]/50" : "border-[#DCD5CC]"
      }`}
    >
      <div className="grid gap-3 md:grid-cols-[1.2fr_90px_2fr_auto]">
        <label>
          <span className={LABEL}>story_slug</span>
          <input
            list="import-slugs"
            className={`${INPUT} font-mono`}
            value={chapter.storySlug}
            onChange={(e) => onChange({ storySlug: e.target.value })}
          />
        </label>
        <label>
          <span className={LABEL}>Số</span>
          <input
            type="number"
            min={1}
            className={`${INPUT} font-mono`}
            value={chapter.number || ""}
            onChange={(e) => onChange({ number: Number(e.target.value) })}
          />
        </label>
        <label>
          <span className={LABEL}>Tiêu đề</span>
          <input
            className={INPUT}
            value={chapter.title}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </label>
        <div className="flex items-end gap-3">
          <label className="flex h-[38px] items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={chapter.published}
              onChange={(e) => onChange({ published: e.target.checked })}
              className="h-4 w-4 accent-[#1A1A1A]"
            />
            Công khai
          </label>
          <button type="button" onClick={onRemove} className={BTN_GHOST}>
            Bỏ
          </button>
        </div>
      </div>

      {/* Xem trước và sửa nội dung */}
      <details className="mt-3">
        <summary className="cursor-pointer font-mono text-[11px] tracking-wider text-[#5C5752] uppercase">
          Nội dung · {chapter.content.length.toLocaleString("vi-VN")} ký tự
        </summary>
        <textarea
          rows={10}
          className={`${INPUT} mt-2 font-serif text-[15px] leading-relaxed`}
          value={chapter.content}
          onChange={(e) => onChange({ content: e.target.value })}
        />
      </details>
      {!chapter.content && (
        <p className="mt-2 text-xs text-[#B83232]">Chương này chưa có nội dung.</p>
      )}

      <IssueList errors={errors} warnings={warnings} />
    </div>
  );
}
