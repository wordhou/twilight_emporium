import { Pool, QueryResult } from "pg";

const pool = new Pool();

const query = (text: string, params?: any[]): Promise<QueryResult<any>> =>
  pool.query(text, params);

export default {
  query,
};
