import express from "express";
import cors from "cors";
import inspirationApiRouter from "./routes/inspiration.routes.js";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);

app.use("/api", inspirationApiRouter);

export default app;
