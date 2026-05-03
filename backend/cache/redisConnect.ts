import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();


const redisClient = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : undefined,
    }
});

redisClient.on('error', err => console.log('Redis Client Error', err));


export {redisClient};
export async function connectRedis() {
	try {
		await redisClient.connect();
		console.log('Connected to Redis successfully');
	} catch (err) {
		console.error('Error connecting to Redis:', err);
		throw err;
	}
}
