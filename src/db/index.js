import { PrismaClient } from "../generated/prisma/client.js";

const primaClient = new PrismaClient();

async function connectDB() {
  try {
    await primaClient.$connect();
  } catch (err) {
    console.log(`Error while connecting database ${err}`);
    process.exit(1);
  }
}

export default connectDB;
