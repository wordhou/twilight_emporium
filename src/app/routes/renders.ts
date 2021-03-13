import Router from "express-promise-router";
import { TwilightMap, User, MapComment } from "../models";

const urlRoot = process.env["URL_ROOT"] || "localhost:3000";

const router = Router();

router.get("/helloworld", async (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`hello ${JSON.stringify(req.user)}`);
  } else {
    res.send(`hello world, ${JSON.stringify(req.user)}`);
  }
});

router.get("/maps/:id", async (req, res) => {
  const map_id = parseInt(req.params.id);
  const map = await TwilightMap.get(map_id);
  await map.populate();
  const user = req.user as User;
  const userOwnsMap = req.isAuthenticated() && user.user_id === map.user_id;
  const redirect = req.originalUrl;
  console.log(req.path);
  res.render("map", { map, user, urlRoot, userOwnsMap, redirect });
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

/*
router.get("/maps", (req, res) => {
  // Get parameters from URL
  // Use parameters to produce filtered and sorted list
  // Render list
});
*/

export default router;
