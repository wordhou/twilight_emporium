import db from "../db";
import User, { UserData } from "./user";

interface CommentData {
  comment_id?: number;
  created?: Date;
  map_id: number;
  user_id: number;
  text: string;
}

interface Comment extends CommentData {
  user?: User;
}

class Comment {
  constructor({ comment_id, map_id, user_id, text, created }: CommentData) {
    this.comment_id = comment_id;
    this.map_id = map_id;
    this.user_id = user_id;
    this.text = text;
    this.created = created;
  }

  save(): Promise<this> {
    if (this.comment_id === undefined) {
      // TODO create new user
      return this;
    } else {
      // TODO modify existing user
      return this;
    }
  }

  populate(): Result<void> {
  }


  static create({
    map_id,
    user_id,
    text,
  }: {
    map_id: number;
    user_id: number;
    text: string;
  }): Promise<Comment> {}

  static delete(comment_id: number): 

  static get(comment_id: number): Promise<Comment> {}
}

export default Comment;
