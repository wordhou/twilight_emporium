import Router from "express-promise-router";
import TwilightMap from "../models/map";
import Comment from "../models/comment";

const api = Router();

api.use("/", (req, res) => {
  res.setHeader("Content-Type", "application/json");
});

api.post("/maps", async (req, res) => {
  //TODO
});

api.get("/maps/:id", async (req, res) => {
  const map_id = parseInt(req.params.id);
  const map = await TwilightMap.get(map_id);
  res.send(map.getData());
});

api.put("/maps/:id", async (req, res) => {
  const map_id = parseInt(req.params.id);
  const map = await TwilightMap.get(map_id);

  const changes = req.body; // object containing modifications
  // modify map
  res.send(map.getData());
});

api.post("/maps/:id/comments", async (req, res) => {
  const map_id = parseInt(req.params.id);
  const map = await TwilightMap.get(map_id);
  const comment = Comment.create(/*TODO*/);
  //res.send(map.getData());
});

api.put("/maps/:id/comments/:commentId", async (req, res) => {
  const comment_id = parseInt(req.params.commentId);
  const comment = Comment.get(comment_id);
  // TODO modify comment
});

api.delete("/maps/:id/comments/:commentId", async (req, res) => {
  const comment_id = parseInt(req.params.commentId);
  const comment = Comment.delete(comment_id);
  res.send(something);
});

export default api;
