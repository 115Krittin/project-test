import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client.ts";
import { env } from "../config/env.js";

const adapter = new PrismaMariaDb(env.database);
export const prisma = new PrismaClient({ adapter });
