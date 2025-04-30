import mongoose from "mongoose";

async function connectDB() {
  try {
    console.log(process.env.DATABASE_NAME);
    console.log(process.env.DATABASE_URL);

    const connectionInstance = await mongoose.connect(
      `${process.env.DATABASE_URL}/${process.env.DATABASE_NAME}`
    );

    // Checking is connection is established with an host
    console.log(
      "Connection has been establied",
      connectionInstance.connection.host
    );
  } catch (err) {
    console.log(`Error while connecting database ${err}`);
    process.exit(1);
  }
}

export default connectDB;
