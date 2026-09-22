// import 'dotenv/config';
// import postgres from '@prisma/orm-postgres/runtime';
// import type { Contract } from './contract.d';
// import contractJson from './contract.json' with { type: 'json' };

// export const db = postgres<Contract>({
//   contractJson,
//   url: process.env['DATABASE_URL']!,
// });
// src/prisma/db.ts

import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
