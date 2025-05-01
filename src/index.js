import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/index.js";

dotenv.config({ path: ".env" });

connectDB()
  .then(() => {
    console.log("Establishing MongoDB connection");
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Starting Application - Listening to the PORT ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Connection has failed !!!! ${err}`);
  });
