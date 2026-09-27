import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import { defineConfig } from "prisma/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  schema: path.join(root, "prisma/schema.prisma"),
  migrations: {
    path: path.join(root, "prisma/migrations"),
    seed: "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
    directUrl: process.env["DIRECT_URL"],
  },
});