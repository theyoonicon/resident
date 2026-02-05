import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const csvPath = path.join(process.cwd(), "mediit_usernames.csv");
  const content = fs.readFileSync(csvPath, "utf-8");
  const lines = content.trim().split("\n").slice(1); // skip header

  console.log(`Updating ${lines.length} users with usernames...`);

  let updated = 0;
  let notFound = 0;

  for (const line of lines) {
    const [email, username] = line.split(",");

    const result = await prisma.user.updateMany({
      where: { email },
      data: { username },
    });

    if (result.count > 0) {
      updated++;
    } else {
      notFound++;
      console.log(`User not found: ${email}`);
    }
  }

  console.log(`\nUpdated: ${updated}, Not found: ${notFound}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
