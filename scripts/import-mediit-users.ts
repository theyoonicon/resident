import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const csvPath = path.join(process.cwd(), "mediit_users.csv");
  const content = fs.readFileSync(csvPath, "utf-8");
  const lines = content.trim().split("\n");

  // Skip header
  const dataLines = lines.slice(1);

  console.log(`Importing ${dataLines.length} users from mediit...`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const line of dataLines) {
    // Parse CSV - split by comma
    const parts = line.split(",");
    if (parts.length < 5) {
      console.error("Failed to parse line:", line.substring(0, 50));
      errors++;
      continue;
    }

    const [name, email, password, department, year] = parts;

    try {
      // Check if user already exists
      const existing = await prisma.user.findUnique({
        where: { email },
      });

      if (existing) {
        console.log(`Skipping existing user: ${email}`);
        skipped++;
        continue;
      }

      // Create user
      await prisma.user.create({
        data: {
          email,
          name,
          password,
          department,
          year,
          role: "USER",
          verificationStatus: "APPROVED",
        },
      });

      console.log(`Created user: ${name} (${email}) - ${department} ${year}`);
      created++;
    } catch (e) {
      console.error(`Error creating user ${email}:`, e);
      errors++;
    }
  }

  console.log("\n--- Import Complete ---");
  console.log(`Created: ${created}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
