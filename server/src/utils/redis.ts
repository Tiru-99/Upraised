import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config({
    path : './.env'
});

const client = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: 19453
    }
});

export const connectRedis = async () => {
    if (!client.isOpen) {
        try {
            await client.connect();
            console.log("Redis is connected");
        } catch (error) {
            console.error("Something went wrong while connecting to redis", error);
        }
    }
}

client.on("error" , err => console.log("Redis client error" ,err));

export default client ;

