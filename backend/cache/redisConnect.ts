import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();


const client = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : undefined,
    }
});

client.on('error', err => console.log('Redis Client Error', err));


export default client;
export async function connectRedis() {
	try {
		await client.connect();
		console.log('Connected to Redis successfully');
	} catch (err) {
		console.error('Error connecting to Redis:', err);
		throw err;
	}
}
