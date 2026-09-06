import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// drizzle-kit（generate / migrate / studio）用 —— 讀 .env 的 TURSO_* 憑證
export default defineConfig({
  dialect: "turso",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
  strict: true,
  verbose: true,
});
