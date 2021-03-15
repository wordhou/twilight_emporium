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

authRouter.get("/auth/logout", (req, res) => {
  const redirect = req.query.redirect as string | undefined;
  req.logout();
  res.redirect(redirect || "/");
});

export default authRouter;
