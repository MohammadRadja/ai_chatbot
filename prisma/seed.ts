import { PrismaClient } from "@prisma/client";
import { KNOWLEDGE_SOURCES } from "../src/config/sources";

const prisma = new PrismaClient();

async function main() {
  for (const source of KNOWLEDGE_SOURCES) {
    await prisma.knowledgeSource.upsert({
      where: { key: source.key },
      update: {
        title: source.title,
        kind: source.kind,
        url: source.url,
        isActive: true,
      },
      create: {
        key: source.key,
        title: source.title,
        kind: source.kind,
        url: source.url,
      },
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
