import "dotenv/config";
import { defineConfig } from "prisma/config";

// Optional during generate (which needs no live database), required by db pull.
function connectionUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const { DB_HOST, DB_PORT = "3306", DB_USER, DB_PASSWORD, DB_NAME = "itb_csv" } = process.env;
  if (!DB_HOST || !DB_USER || DB_PASSWORD === undefined) return undefined;
  const host = DB_HOST.includes(":") && !DB_HOST.startsWith("[") ? `[${DB_HOST}]` : DB_HOST;
  return `mysql://${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PASSWORD)}@${host}:${DB_PORT}/${encodeURIComponent(DB_NAME)}`;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: connectionUrl(),
  },
});
