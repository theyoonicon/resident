import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config();
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const total = await prisma.user.count({ where: { verificationStatus: 'APPROVED' }});
  console.log('Total approved users:', total);
}
main().finally(() => prisma.$disconnect());
