import User from "./user";
import TwilightMap from "./map";
import MapComment from "./comment";

(async () => {
  try {
    await User.createTable();
    console.log("Creating users table if not exists...");
  } catch (err) {
    console.error("Error creating users table", err);
  }
  try {
    await TwilightMap.createTable();
    console.log("Creating maps table if not exists...");
  } catch (err) {
    console.error("Error creating maps table", err);
  }
  try {
    await MapComment.createTable();
    console.log("Creating comments table if not exists...");
  } catch (err) {
    console.error("Error creating comments table", err);
  }
})();

export { User, TwilightMap, MapComment };
