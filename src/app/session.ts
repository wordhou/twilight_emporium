import session from "express-session";

const sessionSecret = process.env["SESSION_SECRET"];
if (sessionSecret === undefined)
  throw new Error("Env variable SESSION_SECRET is undefined");

export default session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
});
