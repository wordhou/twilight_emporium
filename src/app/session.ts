import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import db, { dbPool } from "./db";
const pgSession = ConnectPgSimple(session);

const sessionSecret = process.env["SESSION_SECRET"];
if (sessionSecret === undefined)
  throw new Error("Env variable SESSION_SECRET is undefined");

async function createSessionsTable(): Promise<void> {
  const exists = await db.tableExists("session");
  if (!exists) {
    console.log("Creating session table in database...");
    try {
      await dbPool.query(
        `CREATE TABLE IF NOT EXISTS "session" (
            "sid" varchar NOT NULL COLLATE "default",
              "sess" json NOT NULL,
              "expire" timestamp(6) NOT NULL
          )
          WITH (OIDS=FALSE);
          ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
          CREATE INDEX "IDX_session_expire" ON "session" ("expire");`
      );
    } catch (err) {
      console.error(err);
    }
  }
}

createSessionsTable();

export default session({
  store: new pgSession({
    pool: dbPool,
  }),
  cookie: { maxAge: 5 * 24 * 60 * 60 * 1000 },
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
});
