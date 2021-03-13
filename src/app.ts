import path from "path";
import express from "express";
import routes from "./app/routes";
import passport from "./app/passport";
import session from "./app/session";
import cookieParser from "cookie-parser";
import methodOverride from "method-override";
const app = express();

app.use(methodOverride("_method"));
app.set("views", path.join(__dirname, "app/views"));
app.set("view engine", "ejs");

app.use(express.static(path.resolve(__dirname, "../public")));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session);
app.use(passport.initialize());
app.use(passport.session());

app.use("/", routes);

app.get("/", (_, res) => {
  res.render("helloworld");
});

app.use(express.static(path.resolve(__dirname, "../dist")));

const server = app.listen(3000);
