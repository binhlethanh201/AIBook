export function slugify(input: string): string {
  const slug = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu tiếng Việt
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Nếu tiêu đề toàn ký tự đặc biệt thì tạo slug ngẫu nhiên
  return slug || `truyen-${Date.now()}`;
}
