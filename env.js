import dotenv from "dotenv";

dotenv.config({ quiet: true });

function required(name) {
  const value = process.env[name];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function port(name, fallback) {
  const text = process.env[name] ?? String(fallback);
  const value = Number(text);
  if (!/^\d+$/.test(text) || !Number.isInteger(value) || value < 1 || value > 65535) {
    throw new Error(`Invalid port in ${name}`);
  }
  return value;
}

const teamCode = process.env.TEAM_CODE || "ip26-grid";
if (!/^[a-zA-Z0-9-]+$/.test(teamCode)) {
  throw new Error("TEAM_CODE must contain only letters, numbers and hyphens");
}

export const env = Object.freeze({
  port: port("PORT", 3000),
  teamCode,
  basePath: `/intproj26/${teamCode}`,
  database: {
    host: required("DB_HOST"),
    port: port("DB_PORT", 3306),
    database: process.env.DB_NAME || "itb_csv",
    user: required("DB_USER"),
    password: required("DB_PASSWORD"),
    connectionLimit: 5,
  },
});
