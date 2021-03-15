import User from "./user";
import TwilightMap from "./map";
import MapComment from "./comment";
import db from "../db";

(async () => {
  try {
    if (!(await db.tableExists("users"))) {
      console.log("Creating users table...");
      await User.createTable();
    }
  } catch (err) {
    console.error("Error creating users table", err);
  }
  try {
    if (!(await db.tableExists("maps"))) {
      await TwilightMap.createTable();
      console.log("Creating maps table if not exists...");
    }
  } catch (err) {
    console.error("Error creating maps table", err);
  }
  try {
    if (!(await db.tableExists("comments"))) {
      await MapComment.createTable();
      console.log("Creating comments table if not exists...");
    }
  } catch (err) {
    console.error("Error creating comments table", err);
  }
})();

export { User, TwilightMap, MapComment };
