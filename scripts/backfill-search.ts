import { PrismaClient } from "@prisma/client";
import { normalizeSearch } from "../lib/normalize";

const prisma = new PrismaClient();

async function main() {
  const stories = await prisma.story.findMany({ select: { id: true, title: true } });
  for (const s of stories) {
    await prisma.story.update({
      where: { id: s.id },
      data: { searchText: normalizeSearch(s.title) },
    });
  }
  console.log(`Đã cập nhật ${stories.length} truyện`);
}

main().finally(() => prisma.$disconnect());
