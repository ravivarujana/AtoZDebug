import mongoose from "mongoose";

async function connectDB() {
  try {
    await mongoose.connect(process.env)
  } catch (err) {
    console.log(`Error while connecting database ${err}`);
  }
}

export default connectDB;
