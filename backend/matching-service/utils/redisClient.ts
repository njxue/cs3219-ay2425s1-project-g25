// redisClient.ts
import { createClient } from 'redis';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = process.env.REDIS_PORT || '6379';

const redisUrl = `redis://${REDIS_HOST}:${REDIS_PORT}`;

const redisClient = createClient({
    url: redisUrl,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
    await redisClient.connect();
})();

export async function logAllQueues() {
    try {
        const queueKeys = await redisClient.keys('queue:*');
        for (const queueKey of queueKeys) {
            const queueContents = await redisClient.lRange(queueKey, 0, -1);
            console.log(`Contents of ${queueKey}:`, queueContents);
        }
    } catch (error) {
        console.error('Error retrieving queue contents:', error);
    }
}

// Load Lua script
const luaScript = fs.readFileSync(path.join(__dirname, 'find_and_remove_match.lua'), 'utf8');

// Export the Lua script
export { luaScript };

export default redisClient;
