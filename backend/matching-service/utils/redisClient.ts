import { createClient } from 'redis';
import * as fs from 'fs';
import * as path from 'path';

const redisClient = createClient({
    url: 'redis://127.0.0.1:6379',
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
