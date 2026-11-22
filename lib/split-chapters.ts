export type ParsedChapter = { number: number; title: string; content: string };

const HEADER = /^===\s*Chương\s+(\d+)\s*:\s*(.+?)\s*===\s*$/gim;

export function splitChapters(raw: string): { chapters: ParsedChapter[]; errors: string[] } {
  const errors: string[] = [];
  const matches = [...raw.matchAll(HEADER)];
  if (matches.length === 0) {
    errors.push("Không tìm thấy dòng tiêu đề chương dạng === Chương N: Tiêu đề ===");
    return { chapters: [], errors };
  }

  const chapters: ParsedChapter[] = matches.map((m, i) => {
    const start = (m.index ?? 0) + m[0].length;
    const end = i + 1 < matches.length ? (matches[i + 1].index ?? raw.length) : raw.length;
    return {
      number: Number(m[1]),
      title: m[2].trim(),
      content: raw.slice(start, end).trim(),
    };
  });

  const seen = new Set<number>();
  for (const c of chapters) {
    if (seen.has(c.number)) errors.push(`Chương ${c.number} bị lặp trong nội dung dán vào`);
    seen.add(c.number);
    if (!c.content) errors.push(`Chương ${c.number} không có nội dung`);
  }

  return { chapters, errors };
}
