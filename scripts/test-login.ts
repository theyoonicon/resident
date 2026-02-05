import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (hash.startsWith("$2a$") || hash.startsWith("$2b$")) {
    return bcrypt.compare(password, hash);
  }
  if (hash.startsWith("pbkdf2:")) {
    const parts = hash.split("$");
    if (parts.length !== 3) return false;
    const [method, salt, storedHash] = parts;
    const [, algo, iterStr] = method.split(":");
    const iterations = parseInt(iterStr, 10);
    return new Promise((resolve) => {
      crypto.pbkdf2(password, salt, iterations, 32, algo, (err, derivedKey) => {
        if (err) return resolve(false);
        resolve(derivedKey.toString("hex") === storedHash);
      });
    });
  }
  if (hash.startsWith("scrypt:")) {
    const parts = hash.split("$");
    if (parts.length !== 3) return false;
    const [method, salt, storedHash] = parts;
    const [, n, r, p] = method.split(":");
    const N = parseInt(n), R = parseInt(r), P = parseInt(p);
    return new Promise((resolve) => {
      crypto.scrypt(password, salt, 64, { N, r: R, p: P, maxmem: 128 * N * R * 2 }, (err, derivedKey) => {
        if (err) { console.error("scrypt error:", err.message); return resolve(false); }
        resolve(derivedKey.toString("hex") === storedHash);
      });
    });
  }
  return false;
}

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "theyoonicon@gmail.com" },
    select: { email: true, name: true, password: true, username: true },
  });
  if (!user) { console.log("User not found"); return; }
  console.log("User:", user.name, user.username, user.email);
  const result = await verifyPassword("yaudrl8735@", user.password!);
  console.log("Result:", result);
}
main().finally(() => prisma.$disconnect());
