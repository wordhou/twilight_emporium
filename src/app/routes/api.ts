import Router from "express-promise-router";
import { User, TwilightMap, MapComment } from "../models";
import { NextFunction, Request, Response } from "express";

import MapCompositor from "../../compositor";
const compositor = new MapCompositor("public/tiles/large/", 364, 317);
compositor.init();

const api = Router();

const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    (req.session as any).redirect = req.originalUrl;
    res.redirect("/auth");
    //res.status(403).send("Must be logged in to continue");
  }
};

api.get("/test", async (req, res) => {
  res.json({
    query: req.query,
    header: req.header,
    user: req.user,
    test: true,
  });
});
api.post("/test", async (req, res) => {
  res.json({
    body: req.body,
    user: req.user,
    test: true,
  });
});

api.post("/maps", requireAuth, async (req, res) => {
  const { map_name, description } = req.body;
  const user_id = (req.user as User).user_id;
  if (user_id === undefined) throw new Error("User has no user_id");
  const map = await TwilightMap.create({ user_id, description, map_name });
  res.json(map);
});

api.get("/maps/:id", async (req, res) => {
  const map_id = parseInt(req.params.id);
  const map = await TwilightMap.get(map_id);
  res.json(map.getData());
});

api.get("/maps/:id/latest/large.jpg", async (req, res) => {
  const map_id = parseInt(req.params.id);
  const map = await TwilightMap.get(map_id);
  const latest = map.versions[map.versions.length - 1];
  const jpg = await compositor.drawTTSMap(latest);
  res.type("jpg").send(jpg);
});

api.put("/maps/:id", requireAuth, async (req, res) => {
  const map_id = parseInt(req.params.id);
  const map = await TwilightMap.get(map_id);
  const { newVersion, map_name, description } = req.body;
  if (map_name !== undefined || description !== undefined) {
    if (newVersion !== undefined) map.versions.push(newVersion);
    await map.save();
  } else if (newVersion !== undefined) {
    await map.addVersion(newVersion);
  }
  res.send(map.getData());
});

api.post("/maps/:id/comments", requireAuth, async (req, res) => {
  const { text, redirect } = req.body;
  const { user_id } = req.user as User;
  if (user_id === undefined)
    throw new Error("user_id is undefined and it shouldn't be");
  const map_id = parseInt(req.params.id);
  //const map = await TwilightMap.get(map_id);
  const comment = await MapComment.create({ user_id, map_id, text });
  if (redirect !== undefined) res.redirect(redirect);
  else res.json(comment);
});

api.put("/maps/:id/comments/:commentId", requireAuth, async (req, res) => {
  const { text, redirect } = req.body;
  const comment_id = parseInt(req.params.commentId);
  const comment = await MapComment.get(comment_id);
  comment.modify({ text });
  await comment.save();
  res.json(comment);
  if (redirect !== undefined) res.redirect(redirect);
  else res.json(comment);
});

api.delete("/maps/:id/comments/:commentId", async (req, res) => {
  const { redirect } = req.body;
  const comment_id = parseInt(req.params.commentId);
  const comment = await MapComment.get(comment_id);
  await comment.delete();
  res.send(comment);
  if (redirect !== undefined) res.redirect(redirect);
  else res.json(comment);
});

export default api;
