import db from "../db";
import Comment from "./comment";

interface MapData {
  map_id?: number;
  user_id: number;
  name: string;
  versions: Uint16Array[];
  description: string;
}

interface TwilightMap extends MapData {
  comments?: Comment[];
}

class TwilightMap {
  constructor({
    map_id,
    user_id,
    description = "",
    versions,
    name = "",
  }: MapData) {
    this.map_id = map_id;
    this.user_id = user_id;
    this.description = description;
    this.versions = versions;
    this.name = name;
  }

  async save(): Promise<this> {
    if (this.map_id === undefined) {
      try {
        const result = await db.query(
          `INSERT INTO maps(user_id, description, versions, name)
          VALUES ($1, $2, $3, $4) RETURNING map_id;`,
          [this.user_id, this.description, this.versions, this.name]
        );
        this.map_id = result.rows[0].id;
      } catch (err) {
        // TODO
      }
    } else {
      const response = await db.query(
        `
        UPDATE maps SET
          user_id = $1,
          description = $2,
          versions = $3,
          name = $4
        WHERE map_id = $5`,
        [this.user_id, this.description, this.versions, this.name]
      );
    }
    return this;
  }

  async populate(): Promise<void> {
    // query database and populate the comments property
  }

  static async create({
    user_id,
    description,
    name,
  }: {
    user_id: number;
    description: string;
    name: string;
  }): Promise<TwilightMap> {
    const map = new TwilightMap({ user_id, description, name, versions: [] });
    map.save();
    return map;
  }

  getData(): MapData {
    return {
      map_id: this.map_id,
      user_id: this.user_id,
      name: this.name,
      versions: this.versions,
      description: this.description,
    };
  }

  /*
  static async get(id: number): Promise<TwilightMap> {
    // query database for map with ID
    // if bad result return Error()
  }
  */

  static async createTable(): Promise<void> {
    try {
      await db.query(`CREATE TABLE IF NOT EXISTS maps (
map_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
user_id INT,
map_name VARCHAR(255) NOT NULL,
description text,
versions SMALLINT[][],
date_created timestamp default current_timestamp,
CONSTRAINT fk_maps
  FOREIGN KEY(user_id)
    REFERENCES users(id)
);`);
    } catch (err) {
      console.error(err);
    }
  }
}

export default TwilightMap;
