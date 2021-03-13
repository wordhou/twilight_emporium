import express from "express";
import passport from "../passport";
const authRouter = express.Router();

authRouter.get(
  "/auth",
  (req, res, next) => {
    (req.session as any).redirect = req.query.redirect;
    console.log(req.query.redirect);
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

authRouter.get(
  "/auth/return",
  passport.authenticate("google", { failureRedirect: "/", session: true }),
  (req, res) => {
    res.redirect((req.session as any).redirect || "/");
  }
);

export default authRouter;
