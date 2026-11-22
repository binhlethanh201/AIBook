import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.USER_EMAIL;
  const password = process.env.USER_PASSWORD;
  const role = process.env.USER_ROLE as Role;

  if (!email || !password) {
    throw new Error("Cần truyền USER_EMAIL và USER_PASSWORD");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role },
    create: { email, passwordHash, role },
  });

  console.log(`Đã tạo/cập nhật user: ${user.email} (${user.role})`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
