import { Pool, QueryResult } from "pg";

export let dbPool: Pool;
if (process.env["LOCAL"] === "local") {
  dbPool = new Pool();
} else {
  dbPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
}

const query = (text: string, params?: any[]): Promise<QueryResult<any>> =>
  dbPool.query(text, params);

const tableExists = async (name: string): Promise<boolean> => {
  const result = await dbPool.query(
    `SELECT EXISTS ( SELECT 1 FROM pg_tables WHERE tablename = $1 );`,
    [name]
  );
  return result.rows[0].exists;
};

export default {
  query,
  tableExists,
};
