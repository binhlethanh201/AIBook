import ExcelJS from "exceljs";

// Bố cục dùng chung cho cả tạo file mẫu và đọc file
export const HEADER_ROW = 4;
export const EXAMPLE_ROW = 5;
export const FIRST_DATA_ROW = 6;
export const DATA_ROWS = 50;
export const LAST_DATA_ROW = FIRST_DATA_ROW + DATA_ROWS - 1;
export const END_MARKER = "▼ QUY TẮC NHẬP LIỆU";

type Validate = "bool" | "posint";

type Col = {
  header: string;
  width: number;
  required: boolean;
  example: string;
  validate?: Validate;
};

export const STORY_COLS: Col[] = [
  { header: "title", width: 36, required: true, example: "Hành trình của AI" },
  { header: "slug", width: 28, required: false, example: "hanh-trinh-cua-ai" },
  { header: "description", width: 50, required: false, example: "Mô tả ngắn về truyện" },
  { header: "cover_url", width: 40, required: false, example: "https://example.com/bia.jpg" },
  { header: "author", width: 20, required: false, example: "Tên tác giả" },
  { header: "status", width: 14, required: false, example: "Đang ra" },
  { header: "genres", width: 28, required: false, example: "Action, Manhwa" },
  { header: "published", width: 12, required: false, example: "TRUE", validate: "bool" },
];

export const CHAPTER_COLS: Col[] = [
  { header: "story_slug", width: 28, required: true, example: "hanh-trinh-cua-ai" },
  { header: "number", width: 10, required: true, example: "1", validate: "posint" },
  { header: "title", width: 36, required: true, example: "Mở đầu" },
  { header: "content", width: 80, required: true, example: "Nội dung chương..." },
  { header: "published", width: 12, required: false, example: "TRUE", validate: "bool" },
];

const STORY_RULES = [
  `Bảng nhập nằm từ hàng ${FIRST_DATA_ROW} đến hàng ${LAST_DATA_ROW}. Mỗi dòng là một truyện, không để dòng trống giữa các truyện.`,
  "Hàng 5 là dòng ví dụ. Có thể để nguyên hoặc xóa, phần ví dụ sẽ tự được bỏ qua khi tải lên.",
  "Không đổi tên cột, không chèn hoặc xóa cột, không đổi tên sheet.",
  "title (bắt buộc): tên truyện, tối đa 200 ký tự.",
  "slug: chỉ dùng chữ thường không dấu, số và dấu gạch ngang, ví dụ hanh-trinh-cua-ai. Để trống sẽ tự tạo từ title. Không được trùng slug của truyện đã có.",
  "cover_url: phải bắt đầu bằng https:// hoặc http://. Để trống nếu chưa có ảnh bìa.",
  "genres: nhiều thể loại cách nhau bằng dấu phẩy, ví dụ: Action, Manhwa.",
  "published: chọn TRUE hoặc FALSE trong ô thả xuống. Để trống = TRUE (công khai).",
  "Muốn thêm chương cho truyện, điền sang sheet Chuong.",
];

const CHAPTER_RULES = [
  `Bảng nhập nằm từ hàng ${FIRST_DATA_ROW} đến hàng ${LAST_DATA_ROW}. Có thể điền cả hai sheet trong cùng một file.`,
  "Hàng 5 là dòng ví dụ, sẽ tự được bỏ qua khi tải lên.",
  "Không đổi tên cột, không chèn hoặc xóa cột, không đổi tên sheet.",
  "story_slug (bắt buộc): slug của truyện trong sheet Truyen cùng file, hoặc slug của truyện đã có trên web.",
  "number (bắt buộc): số nguyên từ 1 trở lên, không trùng số chương đã có của truyện.",
  "title và content (bắt buộc): xuống dòng trong ô bằng Alt+Enter (Windows) hoặc Ctrl+Option+Enter (Mac).",
  "Nội dung nên dài trên 300 từ và không chứa ký hiệu markdown như ** hoặc #.",
  "published: TRUE hoặc FALSE trong ô thả xuống. Để trống = TRUE.",
];

const C = {
  ink: "FF1A1A1A",
  paper: "FFF9F5F1",
  card: "FFFDFBF9",
  line: "FFDCD5CC",
  muted: "FF78736D",
  white: "FFFFFFFF",
  amber: "FF8A6A1F",
};

const BORDER: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: C.line } },
  bottom: { style: "thin", color: { argb: C.line } },
  left: { style: "thin", color: { argb: C.line } },
  right: { style: "thin", color: { argb: C.line } },
};

const solid = (argb: string): ExcelJS.Fill => ({
  type: "pattern",
  pattern: "solid",
  fgColor: { argb },
});

// Giá trị dòng ví dụ, để parser nhận ra và bỏ qua
export const EXAMPLES = {
  Truyen: STORY_COLS.map((c) => c.example),
  Chuong: CHAPTER_COLS.map((c) => c.example),
};

function buildSheet(
  wb: ExcelJS.Workbook,
  name: "Truyen" | "Chuong",
  title: string,
  cols: Col[],
  rules: string[]
) {
  const ws = wb.addWorksheet(name, {
    views: [{ state: "frozen", ySplit: HEADER_ROW }],
  });

  // Khai báo kiểu tối thiểu cho dataValidations, vì type của exceljs không có sẵn thuộc tính này
  type DataValidationsApi = {
    add: (range: string, rule: Record<string, unknown>) => void;
  };
  const dv = (ws as unknown as { dataValidations: DataValidationsApi }).dataValidations;

  ws.getRow(1).height = 26;
  ws.getCell("A1").value = title;
  ws.getCell("A1").font = { bold: true, size: 16, color: { argb: C.ink } };
  ws.getCell("A2").value =
    `Điền dữ liệu từ hàng ${FIRST_DATA_ROW}. Đọc quy tắc ở cuối bảng trước khi nhập.`;
  ws.getCell("A2").font = { size: 10, color: { argb: C.muted } };

  ws.getRow(HEADER_ROW).height = 22;

  cols.forEach((col, i) => {
    const n = i + 1;
    const letter = ws.getColumn(n).letter;
    ws.getColumn(n).width = col.width;

    // Hàng 3: nhãn bắt buộc hoặc tùy chọn
    const tag = ws.getCell(3, n);
    tag.value = col.required ? "BẮT BUỘC" : "TÙY CHỌN";
    tag.font = { size: 8, bold: true, color: { argb: col.required ? C.ink : C.muted } };
    tag.alignment = { horizontal: "left", vertical: "middle" };

    // Hàng 4: tiêu đề cột
    const head = ws.getCell(HEADER_ROW, n);
    head.value = col.header;
    head.font = { bold: true, color: { argb: C.white } };
    head.fill = solid(C.ink);
    head.alignment = { vertical: "middle", horizontal: "left" };
    head.border = BORDER;

    // Hàng 5: dòng ví dụ
    const ex = ws.getCell(EXAMPLE_ROW, n);
    ex.value = col.example;
    ex.font = { italic: true, color: { argb: C.muted } };
    ex.fill = solid(C.paper);
    ex.border = BORDER;

    // Vùng nhập liệu có khung
    const range = `${letter}${FIRST_DATA_ROW}:${letter}${LAST_DATA_ROW}`;
    for (let r = FIRST_DATA_ROW; r <= LAST_DATA_ROW; r++) {
      const cell = ws.getCell(r, n);
      cell.border = BORDER;
      cell.fill = solid(C.card);
      cell.alignment = { vertical: "top", horizontal: "left" };
    }

    if (col.validate === "bool") {
      dv.add(range, {
        type: "list",
        allowBlank: true,
        formulae: ['"TRUE,FALSE"'],
        showErrorMessage: true,
        errorTitle: "Giá trị không hợp lệ",
        error: "Chọn TRUE hoặc FALSE trong danh sách",
      });
    }
    if (col.validate === "posint") {
      dv.add(range, {
        type: "whole",
        operator: "greaterThanOrEqual",
        allowBlank: true,
        formulae: [1],
        showErrorMessage: true,
        errorTitle: "Số chương không hợp lệ",
        error: "Nhập số nguyên từ 1 trở lên",
      });
    }
  });

  // Quy tắc nằm ngay dưới bảng nhập
  const markerRow = LAST_DATA_ROW + 2;
  ws.getCell(markerRow, 1).value = END_MARKER;
  ws.getCell(markerRow, 1).font = { bold: true, size: 12, color: { argb: C.ink } };

  rules.forEach((text, i) => {
    const cell = ws.getCell(markerRow + 1 + i, 1);
    cell.value = `${i + 1}. ${text}`;
    cell.font = { size: 11, color: { argb: C.ink } };
  });
}

export async function buildTemplate(): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "AI-Book";

  buildSheet(wb, "Truyen", "NHẬP TRUYỆN", STORY_COLS, STORY_RULES);
  buildSheet(wb, "Chuong", "NHẬP CHƯƠNG", CHAPTER_COLS, CHAPTER_RULES);

  const out = await wb.xlsx.writeBuffer();
  return Buffer.from(out);
}
