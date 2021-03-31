import Router from "express-promise-router";
import { User, TwilightMap, MapComment } from "../models";
import { NextFunction, Request, Response } from "express";

import MapCompositor from "../../compositor";
const compositor = new MapCompositor("public/tiles/large/", 364, 317);

const api = Router();

const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    let redirect;
    if (req.params.redirect) redirect = req.params.redirect;
    if (req.body.redirect) redirect = req.body.redirect;
    res.redirect(`/auth?redirect=${redirect}`);
  }
};

api.get("/maps", async (req, res) => {
  const maps = await TwilightMap.query();
  res.json(maps);
});

api.post("/maps", requireAuth, async (req, res) => {
  const { goToEditor, map_name, description, published, newVersion } = req.body;
  const user_id = (req.user as User).user_id;
  if (user_id === undefined) throw new Error("User has no user_id");
  const map = await TwilightMap.create({
    user_id,
    description,
    map_name,
    published,
    newVersion,
  });
  if (goToEditor) res.redirect(`/editor?map_id=${map.map_id}`);
  else res.json(map);
});

/** Makes a copy of the map with a given id */
api.post("/maps/:id/copy", requireAuth, async (req, res) => {
  const user_id = (req.user as User).user_id;
  const { goToEditor } = req.body;
  if (user_id === undefined) throw new Error("User has no user_id");
  const map_id = parseInt(req.params.id);
  const map = await TwilightMap.get(map_id);
  const { map_name, description, published, versions } = map;

  const newMapData = {
    user_id,
    description,
    map_name: `Copy of ${map_name}`,
    published,
    newVersion: versions[versions.length - 1],
  };
  console.log(newMapData);
  const copy = await TwilightMap.create(newMapData);
  if (goToEditor) res.redirect(`/editor?map_id=${copy.map_id}`);
  else res.json(copy);
});

api.get("/maps/:id", async (req, res) => {
  const map_id = parseInt(req.params.id);
  const map = await TwilightMap.get(map_id);
  res.json(map.getData());
});

api.delete("/maps/:id", async (req, res) => {
  console.log("HITTING DELETE API!");
  const map_id = parseInt(req.params.id);
  const { redirect } = req.body;
  const map = await TwilightMap.get(map_id);
  await map.delete();
  if (redirect !== undefined) res.redirect(redirect);
  else res.send("Success");
});

api.get("/maps/:id/latest/large.jpg", async (req, res) => {
  const map_id = parseInt(req.params.id);
  const map = await TwilightMap.get(map_id);
  const latest = map.versions[map.versions.length - 1];
  const jpg = await compositor.drawTTSMap({
    tts: latest,
    scale: 0.5,
    color: "#dde5ea",
  });
  res.type("jpg").send(jpg);
});

api.get("/maps/:id/latest/small.jpg", async (req, res) => {
  const map_id = parseInt(req.params.id);
  const map = await TwilightMap.get(map_id);
  const latest = map.versions[map.versions.length - 1];
  const jpg = await compositor.drawTTSMap({
    tts: latest,
    size: 250,
    color: "#dde5ea",
  });
  res.type("jpg").send(jpg);
});

api.put("/maps/:id", requireAuth, async (req, res) => {
  const map_id = parseInt(req.params.id);
  const map = await TwilightMap.get(map_id);
  const user = req.user as User;
  if (user.user_id !== map.user_id) {
    return res.status(403).send("Forbidden");
  }
  const { newVersion, map_name, published, description, redirect } = req.body;
  if (map_name !== undefined) map.map_name = map_name;
  if (description !== undefined) map.description = description;
  if (published !== undefined) map.published = published;
  if (newVersion !== undefined && newVersion !== map.latest)
    map.versions.push(newVersion);
  await map.save();
  if (redirect !== undefined) res.redirect(redirect);
  else res.json(map.getData());
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
  console.log("PUT", req.path);
  const { text, redirect } = req.body;
  console.log(text, redirect);
  const comment_id = parseInt(req.params.commentId);
  const comment = await MapComment.get(comment_id);
  const user = req.user as User;
  if (comment.user_id !== user.user_id) {
    res.status(403).send("Forbidden");
  } else {
    comment.modify({ text });
    await comment.save();
    if (redirect !== undefined) res.redirect(redirect);
    else res.json(comment);
  }
});

api.delete("/maps/:id/comments/:commentId", async (req, res) => {
  const { redirect } = req.body;
  const user = req.user as User;
  const comment_id = parseInt(req.params.commentId);
  const comment = await MapComment.get(comment_id);
  if (comment.user_id !== user.user_id) {
    res.status(403).send("Forbidden");
  } else {
    await comment.delete();
    if (redirect !== undefined) res.redirect(redirect);
    else res.json(comment);
  }
});

export default api;
