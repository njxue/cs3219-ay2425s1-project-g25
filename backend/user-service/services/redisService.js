import redis from "redis";

class RedisService {
  constructor() {
    this.redisClient = redis.createClient({
      url: "redis://peerprep-redis:6379",
    });
    this.redisClient.on("error", (err) => {
      console.error("Redis error:", err);
    });
  }
  async connect() {
    try {
      await this.redisClient.connect();
      console.log("Connected to Redis");
    } catch (error) {
      console.error("Error connecting to Redis:", error);
    }
  }
  async setKeyWithExpiration(key, value, expiration) {
    try {
      await this.redisClient.set(key, value, { EX: expiration });
      console.log(`Set ${key} in Redis with expiration of ${expiration} seconds`);
    } catch (error) {
      console.error("Error setting key in Redis:", error);
    }
  }

  async exists(key) {
    try {
      const count = await this.redisClient.exists(key);
      return count === 1;
    } catch (error) {
      console.error("Error checking key existence in Redis:", error);
      return false;
    }
  }
}

export default new RedisService();
