export type CheckIssue = { level: "error" | "warn"; message: string };

const MIN_WORDS = 300;

export function checkContent(content: string): CheckIssue[] {
  const issues: CheckIssue[] = [];
  const words = content.trim().split(/\s+/).filter(Boolean).length;

  if (words < MIN_WORDS) {
    issues.push({
      level: "warn",
      message: `Nội dung chỉ có ${words} từ, nên trên ${MIN_WORDS} từ để tránh bị từ chối quảng cáo.`,
    });
  }
  if (/\*\*|__|^#{1,6}\s/m.test(content)) {
    issues.push({
      level: "warn",
      message: "Còn ký hiệu markdown (** hoặc #). Hãy xóa trước khi đăng.",
    });
  }
  if (/\[(?:source|link|http)/i.test(content) || /https?:\/\//i.test(content)) {
    issues.push({
      level: "warn",
      message: "Có đường link trong nội dung. Kiểm tra lại có phải nội dung đăng lại không.",
    });
  }
  return issues;
}
