import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/index.js";
import mongoose from "mongoose";

dotenv.config({ path: ".env" });

mongoose.connection.on("error", (error) => {
  console.log(`Listening to the error after the initial connection ${error}`);
});

connectDB()
  .then(() => {
    console.log("inside the success response");
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Start listening to the PORT ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Connection has failed !!!! ${err}`);
  });
