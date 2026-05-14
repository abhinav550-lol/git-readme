import {Redis} from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const connection = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
    ? parseInt(process.env.REDIS_PORT)
    : 6379,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,

  maxRetriesPerRequest: null,
});

connection.on("connect", () => {
  console.log("Worker Redis connected");
});

connection.on("error", (err : unknown) => {
  console.log("Worker Redis Error:", err);
});

export {connection};