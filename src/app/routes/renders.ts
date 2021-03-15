import Router from "express-promise-router";
import { TwilightMap, User, MapComment } from "../models";

const urlRoot = process.env["URL_ROOT"] || "http://localhost:3000";

const router = Router();

router.get("/", async (req, res) => {
  const user = req.user as User | undefined;
  const redirect = req.originalUrl;
  res.render("home", { user, redirect, urlRoot });
});

router.get("/maps/:id", async (req, res) => {
  const map_id = parseInt(req.params.id);
  const map = await TwilightMap.get(map_id);
  await map.populate();
  const user = req.user as User | undefined;
  const userOwnsMap = user && user.user_id === map.user_id;
  if (!map.published && (!user || user.user_id !== map.user_id)) {
    res.redirect("/");
  } else {
    const redirect = req.originalUrl;
    res.render("map", { map, user, urlRoot, userOwnsMap, redirect });
  }
});

router.get("/editor", async (req, res) => {
  const map_id = req.query.map_id as string | undefined;
  const user = req.user;
  const redirect = req.originalUrl;
  const map = map_id === undefined ? undefined : await TwilightMap.get(map_id);
  res.render("editor", {
    map_id,
    map,
    user,
    urlRoot,
    redirect,
  });
});

router.get("/maps", async (req, res) => {
  const user = req.user as User | undefined;
  const user_id = user !== undefined ? user.user_id : undefined;
  const maps = await TwilightMap.query(user_id);
  res.render("maps", {
    user,
    maps,
    urlRoot,
    redirect: req.originalUrl,
  });
});

router.get("/yourmaps", async (req, res) => {
  const user = req.user as User | undefined;
  if (user === undefined) {
    res.redirect("/");
  } else {
    const user_id = user !== undefined ? user.user_id : undefined;
    const maps = await TwilightMap.query(user_id, user_id);
    res.render("maps", {
      user: req.user,
      maps,
      urlRoot,
      redirect: req.originalUrl,
    });
  }
});

export default router;
