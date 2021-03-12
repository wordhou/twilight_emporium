import passport from "passport";
import passportGoogle from "passport-google-oauth20";
import User from "./models/user";

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
      /*
      User.getByGoogleId(profile.id)
        .then((user: User) => {
          cb(null, user);
        })
        .catch((err: Error) => {
          cb(err);
        });
        */
      cb(null, profile);
    }
  )
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((obj: any, cb) => {
  /*
  User.get(id)
    .then((user: User) => {
      cb(null, user);
    })
    .catch((err: Error) => cb(err));
  cb(null);
  */
  cb(null, obj);
});

export default passport;
