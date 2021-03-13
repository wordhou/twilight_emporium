import db from "../db";
import { Profile } from "passport-google-oauth20";

export interface UserData {
  user_id?: number;
  google_id: string;
  display_name: string;
}

interface User extends UserData {}

class User {
  profile?: Profile;

  constructor({ user_id, google_id, display_name }: UserData) {
    // TODO validate data
    this.user_id = user_id;
    this.google_id = google_id;
    this.display_name = display_name;
  }

  async save(): Promise<this> {
    if (this.user_id === undefined) {
      // create new user
      const result = await db.query(
        `INSERT INTO users(display_name, google_id)
          VALUES ($1, $2) RETURNING user_id`,
        [this.display_name, this.google_id]
      );
      this.user_id = result.rows[0].user_id;
    } else {
      // modify existing user
      await db.query(
        `UPDATE maps SET
          display_name = $1,
          WHERE user_id = $2`,
        [this.display_name, this.user_id]
      );
    }
    return this;
  }

  modify({ display_name }: { display_name?: string }): this {
    if (display_name !== undefined) this.display_name = display_name;
    return this;
  }

  static async create({
    google_id,
    display_name,
  }: {
    google_id: string;
    display_name: string;
  }): Promise<User> {
    const user = new User({ google_id, display_name });
    await user.save();
    return user;
  }

  static async get(user_id: number): Promise<User> {
    // query table user for user with id
    // construct a user object with the database values
    // return it.
    const result = await db.query(`select * from users where user_id = $1`, [
      user_id,
    ]);
    if (result.rowCount === 0) throw new Error(`No user with id ${user_id}`);
    //const { user_id, google_id, display_name } = result.rows[0];
    return new User(result.rows[0]);
  }

  static async getByGoogleProfile(profile: Profile): Promise<User> {
    let user: User;
    const result = await db.query(`select * from users where google_id = $1`, [
      profile.id,
    ]);
    if (result.rowCount === 0) {
      console.log("Adding new user to database");
      user = await User.create({
        google_id: profile.id,
        display_name: profile.displayName,
      });
    } else {
      console.log("Loading existing user from database");
      user = new User(result.rows[0]);
    }
    user.profile = profile;

    return user;
  }

  static async createTable(): Promise<void> {
    await db.query(`CREATE TABLE IF NOT EXISTS users (
  user_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  google_id text UNIQUE NOT NULL,
  display_name varchar(255) NOT NULL
  );`);
  }
}

export default User;
