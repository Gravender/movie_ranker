import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "~/env";
import * as schema from "./schema";


const connection = await mysql.createConnection({
  host: env.DATABASE_URL,
  port: parseInt(env.DATABASE_PORT),
  user: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  database: env.DATABASE_NAME,
  multipleStatements: true,
});

export const db = drizzle(connection, { schema: schema, mode: "default" });