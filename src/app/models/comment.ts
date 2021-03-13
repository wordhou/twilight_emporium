import db from "../db";
import { UserData } from "./user";

interface CommentData {
  comment_id?: number;
  created?: string;
  updated?: string;
  map_id: number;
  user_id: number;
  text: string;
  user?: UserData;
  deleted?: boolean;
}

interface Comment extends CommentData {}

class Comment {
  constructor({
    comment_id,
    map_id,
    user_id,
    text,
    created,
    updated,
    user,
    deleted = false,
  }: CommentData) {
    this.comment_id = comment_id;
    this.created = created;
    this.updated = updated;
    this.deleted = deleted;
    this.created = created;
    this.map_id = map_id;
    this.user_id = user_id;
    this.user = user;
    this.text = text;
  }

  async save(): Promise<this> {
    if (this.deleted) throw new Error(`Comment has been deleted`);
    if (this.comment_id === undefined) {
      const result = await db.query(
        `insert into comments(map_id, user_id, text) values ($1, $2, $3) returning comment_id, created;`,
        [this.map_id, this.user_id, this.text]
      );
      this.comment_id = result.rows[0].comment_id;
      this.created = result.rows[0].created;
    } else {
      await db.query(
        `UPDATE comments SET
          text = $1
          WHERE comment_id = $2;
          `,
        [this.text, this.comment_id]
      );
    }
    return this;
  }

  modify({ text }: { text?: string }): this {
    if (text !== undefined) this.text = text;
    return this;
  }

  static async create({
    map_id,
    user_id,
    text,
  }: {
    map_id: number;
    user_id: number;
    text: string;
  }): Promise<Comment> {
    const comment = new Comment({ map_id, user_id, text });
    await comment.save();
    return comment;
  }

  async delete(): Promise<void> {
    this.deleted = true;
    await db.query(`UPDATE comment SET deleted = true WHERE comment_id = $1;`, [
      this.comment_id,
    ]);
  }

  static async get(comment_id: number): Promise<Comment> {
    const result = await db.query(
      `select * from comments where comment_id = $1;`,
      [comment_id]
    );
    if (result.rowCount === 0)
      throw new Error(`No comment found with comment_id ${comment_id}`);
    return new Comment(result.rows[0]);
  }

  static async createTable(): Promise<void> {
    await db.query(
      `CREATE TABLE IF NOT EXISTS comments (
        comment_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        user_id INT,
        map_id INT,
        text text,
        created timestamp default current_timestamp,
        updated timestamp default current_timestamp,
        deleted boolean default false,
        CONSTRAINT fk_comments_user
          FOREIGN KEY(user_id)
            REFERENCES users(user_id),
        CONSTRAINT fk_comments_map
          FOREIGN KEY(map_id)
            REFERENCES maps(map_id)
      );`
    );
    await db.query(
      `CREATE OR REPLACE FUNCTION update_modified_column()   
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated = now();
    RETURN NEW;   
END;
$$ language 'plpgsql';`
    );
    await db.query(`DROP TRIGGER update_customer_modtime ON comments`);
    await db.query(
      `CREATE TRIGGER update_customer_modtime BEFORE UPDATE ON comments FOR EACH ROW EXECUTE PROCEDURE  update_modified_column();`
    );
  }
}

export default Comment;
