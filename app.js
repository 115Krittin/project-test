import express from "express";
import { env } from "./config/env.js";
import { apiRouter } from "./routes/api.routes.js";

export const app = express();
app.disable("x-powered-by");

// Direct development URLs and the unchanged full path forwarded by the proxy.
app.use(["/api/v1", `${env.basePath}/api/v1`], (_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
}, apiRouter);

app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((error, _req, res, _next) => {
  console.error("API request failed", { name: error.name, code: error.code });
  res.status(500).json({ message: "There is a problem. Please try again later." });
});
