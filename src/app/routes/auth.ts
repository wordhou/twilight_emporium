import express from "express";
import passport from "../passport";
const authRouter = express.Router();

authRouter.get("/auth", passport.authenticate("google", { scope: "email" }));

authRouter.get(
  "/auth/return",
  passport.authenticate("google", { failureRedirect: "/", session: true }),
  (req, res) => {
    res.json(req.user);
  }
);

export default authRouter;
