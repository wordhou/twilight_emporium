import Router from "express-promise-router";
import { TwilightMap, User, MapComment } from "../models";

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
  console.log("(renders.ts 16): req.params.id = ", req.params.id, map_id);
  const map = await TwilightMap.get(map_id);
  await map.populate();
  const user = req.user as User;
  const userOwnsMap = req.isAuthenticated() && user.user_id === map.user_id;
  const redirect = req.path;
  res.render("map", { map, user, userOwnsMap, redirect });
});

router.get("/editor", async (req, res) => {
  res.render("editor", { user: req.user, redirect: req.path });
});

/*
router.get("/maps", (req, res) => {
  // Get parameters from URL
  // Use parameters to produce filtered and sorted list
  // Render list
});
*/

export default router;
