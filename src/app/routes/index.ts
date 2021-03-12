import express from "express";
const router = express.Router();

//import apiRouter from "./api";
import rendersRouter from "./renders";
import authRouter from "./auth";

router.use("/", authRouter);
//router.use("/api/", apiRouter);
router.use("/", rendersRouter);

export default router;
