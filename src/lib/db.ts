import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  ssl: process.env.DATABASE_URL?.includes("cloud")
    ? { rejectUnauthorized: false }
    : undefined,
});

export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const res = await pool.query(text, params);
  return res.rows as T[];
}

export default pool;
