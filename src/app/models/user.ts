import db from "../db";

export interface UserData {
  user_id?: number;
  google_id: string;
  email: string;
  display_name: string;
}

interface User extends UserData {}

class User {
  constructor({ user_id, google_id, email, display_name }: UserData) {
    // TODO validate data
    this.user_id = user_id;
    this.google_id = google_id;
    this.email = email;
    this.display_name = display_name;
  }

  async save(): Promise<void> {
    if (this.user_id === undefined) {
      // create new user
      const result = await db.query(
        `INSERT INTO users(email, display_name)
          VALUES ($1, $2, $3) RETURN user_id`,
        [this.email, this.display_name, this.google_id]
      );
      this.user_id = result.rows[0].user_id;
    } else {
      // modify existing user
      await db.query(
        `UPDATE maps SET
          email = $1,
          display_name = $2,
          WHERE user_id = $3`,
        [this.email, this.display_name, this.user_id]
      );
    }
  }

  static create({
    google_id,
    display_name,
    email,
  }: {
    google_id: string;
    display_name: string;
    email: string;
  }): User | Error {
    const user = new User({ google_id, display_name, email });
    user.save();
    return user;
  }

  static async get(id: number): Promise<User> {
    // query table user for user with id
    // construct a user object with the database values
    // return it.
    const result = await db.query(`select * from users where id = $1`, [id]);
    if (result.rowCount === 0) throw new Error(`No user with id ${id}`);
    //const { user_id, google_id, display_name, email } = result.rows[0];
    return new User(result.rows[0]);
  }

  static async getByGoogleId(google_id: string): Promise<User> {
    const result = await db.query(`select * from users where google_id = $1`, [
      google_id,
    ]);
    if (result.rowCount === 0) throw new Error("No user with google_id");
    return new User(result.rows[0]);
  }

  static async createTable(): Promise<void> {
    try {
      await db.query(`CREATE TABLE IF NOT EXISTS users (
  user_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  google_id text UNIQUE NOT NULL,
  display_name varchar(255) NOT NULL,
  email text UNIQUE NOT NULL
  );`);
    } catch (err) {
      console.error(err);
    }
  }
}

export default User;
