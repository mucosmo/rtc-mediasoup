const redis = require('redis');

class RedisService {
    constructor() {
        // 创建客户端
        const redisClient = redis.createClient({
            url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/${process.env.REDIS_DB}`,
            password: process.env.REDIS_PASSWORD
        })
        redisClient.connect();
        this.redisClient = redisClient;
    };

    /**
     * redis set
     * @param {string} key 键
     * @param {string} val 值
     * @param {number} timeout 过期时间，单位 s
     */
    async set(key, val, timeout = 60 * 60) {
        if (typeof val === 'object') {
            val = JSON.stringify(val)
        }
        await this.redisClient.set(key, val)
        await this.redisClient.expire(key, timeout)
    }

    /**
     * redis get
     * @param {string} key 键
     */
    async get(key) {
        const val = await this.redisClient.get(key);
        return val;
    }

}

/**signleton */
exports.RedisService = new RedisService();
