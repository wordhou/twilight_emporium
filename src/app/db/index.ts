import { Pool, QueryResult } from "pg";

let pool: Pool;
if (process.env["LOCAL"] === "local") {
  pool = new Pool();
} else {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
}

const query = (text: string, params?: any[]): Promise<QueryResult<any>> =>
  pool.query(text, params);

export default {
  query,
};
