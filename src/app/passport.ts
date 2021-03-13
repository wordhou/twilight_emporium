import passport from "passport";
import passportGoogle from "passport-google-oauth20";
import { User } from "./models";

const GoogleStrategy = passportGoogle.Strategy;

const googleClientId = process.env["GOOGLE_CLIENT_ID"];
if (googleClientId === undefined)
  throw new Error("No clientID in env variable GOOGLE_CLIENT_ID");
const googleClientSecret = process.env["GOOGLE_CLIENT_SECRET"];
if (googleClientSecret === undefined)
  throw new Error("No clientSecret in env variable GOOGLE_CLIENT_SECRET");

passport.use(
  new GoogleStrategy(
    {
      clientID: googleClientId,
      clientSecret: googleClientSecret,
      callbackURL: "/auth/return",
    },
    (accessToken, refreshToken, profile, cb) => {
      User.getByGoogleProfile(profile)
        .then((user: User) => {
          cb(null, user);
        })
        .catch((err: Error) => {
          cb(err);
        });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, (user as User).user_id);
  //done(null, user);
});

passport.deserializeUser((user_id: number, done) => {
  //done(null, obj as User);
  User.get(user_id)
    .then((user: User) => {
      done(null, user);
    })
    .catch((err: Error) => done(err));
});

export default passport;
