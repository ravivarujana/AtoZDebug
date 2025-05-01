import express from "express";
import cors from "cors";
import inspirationApiRouter from "./routes/inspiration.routes.js";
import userRouter from "./routes/user.routes.js";
import cookieParse from "cookie-parser";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);

app.use(cookieParse());

app.use("/api/user", userRouter);
app.use("/api", inspirationApiRouter);

export default app;
