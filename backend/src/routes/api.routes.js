import { Router } from "express";
import { env } from "../config/env.js";
import { listSchedules } from "../controllers/schedules.controller.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", team: env.teamCode });
});

apiRouter.get("/schedules", listSchedules);
