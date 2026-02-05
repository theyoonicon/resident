import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.update({
    where: { email: "theyoonicon@gmail.com" },
    data: {
      name: "윤명기",
      username: "theyoonicon",
      password: "scrypt:32768:8:1$1lTXzzB4oHoZwZMM$84115882e2f1b41a8e88567032db661169712a45e4c2b3b1dfe1c479f1ab2563c9ed42e6ed0d7c7e2156959ef716880673b8f4dd4612f43a8a66599d66540441",
      role: "ADMIN",
      verificationStatus: "APPROVED",
    },
  });
  console.log("Updated:", user.name, user.role, user.verificationStatus);
}
main().finally(() => prisma.$disconnect());
