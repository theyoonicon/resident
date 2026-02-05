import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.user.update({
    where: { email: "kirinyoon@naver.com" },
    data: { emailVerified: null },
  });
  const user = await prisma.user.findUnique({
    where: { email: "kirinyoon@naver.com" },
    select: { email: true, name: true, emailVerified: true, role: true },
  });
  console.log("Updated:", user);
}

main().finally(() => prisma.$disconnect());
