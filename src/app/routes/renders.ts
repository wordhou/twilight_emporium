import Router from "express-promise-router";
//import TwilightMap from "../models/map";

const router = Router();

router.get("/helloworld", async (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`hello ${JSON.stringify(req.user)}`);
  } else {
    res.send(`hello world`);
  }
});

/*
router.get("/maps/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const map = await TwilightMap.get(id);
  await map.populate();
  res.render("map", map);
});

router.get("/maps", (req, res) => {
  // Get parameters from URL
  // Use parameters to produce filtered and sorted list
  // Render list
});
*/

export default router;
