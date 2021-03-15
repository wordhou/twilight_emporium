import db from "../db";
import Comment from "./comment";
import User from "./user";

export interface MapData {
  map_id?: number;
  created?: string;
  user_id?: number;
  map_name: string;
  versions: string[];
  description: string;
}

interface TwilightMap extends MapData {
  comments?: Comment[];
  author?: User;
}

class TwilightMap {
  constructor({
    map_id,
    user_id,
    description = "",
    versions,
    created,
    map_name = "",
  }: MapData) {
    this.map_id = map_id;
    this.created = created;
    this.user_id = user_id;
    this.description = description;
    this.versions = versions;
    this.map_name = map_name;
  }

  async save(): Promise<this> {
    if (this.map_id === undefined) {
      const result = await db.query(
        `INSERT INTO maps(user_id, description, versions, map_name)
        VALUES ($1, $2, $3, $4) RETURNING map_id, created;`,
        [this.user_id, this.description, this.versions, this.map_name]
      );
      this.map_id = result.rows[0].map_id;
      this.created = result.rows[0].created;
    } else {
      await db.query(
        `UPDATE maps SET
          description = $1,
          versions = $2,
          map_name = $3
        WHERE map_id = $4;`,
        [this.description, this.versions, this.map_name, this.map_id]
      );
    }
    return this;
  }

  getData(): MapData {
    return {
      map_id: this.map_id,
      user_id: this.user_id,
      map_name: this.map_name,
      versions: this.versions,
      description: this.description,
      created: this.created,
    };
  }

  async addVersion(newVersion: string): Promise<this> {
    await db.query(
      `UPDATE maps SET versions = array_append(versions, $1) WHERE map_id = $2;`,
      [newVersion, this.map_id]
    );
    this.versions.push(newVersion);
    return this;
  }

  get latest(): string {
    return this.versions[this.versions.length - 1];
  }

  modify({
    map_name,
    description,
  }: {
    map_name?: string;
    description?: string;
  }): this {
    if (map_name !== undefined) this.map_name = map_name;
    if (description !== undefined) this.description = description;
    return this;
  }

  async populate(): Promise<void> {
    const comments = await db.query(
      `select c.*, u.google_id, u.display_name
        from comments c
        INNER JOIN users u on c.user_id = u.user_id
        INNER JOIN maps m on c.map_id = m.map_id
        where m.map_id = $1
      `,
      [this.map_id]
    );
    this.comments = comments.rows.map((row) => {
      const {
        user_id,
        comment_id,
        text,
        created,
        updated,
        deleted,
        google_id,
        display_name,
      } = row;
      const user = new User({ user_id, google_id, display_name });
      return new Comment({
        comment_id,
        map_id: this.map_id as number,
        user_id,
        text,
        created,
        updated,
        user,
        deleted,
      });
    });
    if (this.user_id === undefined) throw new Error("Map has no user_id");
    const author = await User.get(this.user_id);
    this.author = author;
  }

  static async create({
    user_id,
    description,
    map_name,
    versions = [],
  }: {
    user_id: number;
    description: string;
    map_name: string;
    versions?: string[];
  }): Promise<TwilightMap> {
    const map = new TwilightMap({ user_id, description, map_name, versions });
    await map.save();
    return map;
  }

  static async get(id: number | string): Promise<TwilightMap> {
    if (typeof id === "string") id = parseInt(id);
    const result = await db.query(`select * from maps where map_id = $1`, [id]);
    if (result.rowCount === 0) throw new Error(`No map with map_id ${id}`);
    return new TwilightMap(result.rows[0]);
  }

  static async createTable(): Promise<void> {
    await db.query(
      `CREATE TABLE IF NOT EXISTS maps (
          map_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          user_id INT,
          map_name VARCHAR(255) NOT NULL,
          description text,
          versions text[],
          created timestamp default current_timestamp,
          updated timestamp default current_timestamp,
          CONSTRAINT fk_maps
            FOREIGN KEY(user_id)
              REFERENCES users(user_id)
          );`
    );
  }

  static async query(): Promise<Array<TwilightMap>> {
    const result = await db.query(
      `select m.map_id, m.map_name, m.description, m.created, m.updated, u.display_name
      from maps m
      INNER JOIN users u on m.user_id = u.user_id`,
      []
    );
    return result.rows;
  }
}

export default TwilightMap;
