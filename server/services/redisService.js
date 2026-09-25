/**
 * AgriNex — Redis Caching Service
 * Connects to Redis instance when available, with an in-memory TTL fallback
 * to guarantee resilience across local dev, staging, and Docker environments.
 */

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const DEFAULT_TTL_SECONDS = parseInt(process.env.MARKET_PRICE_CACHE_TTL, 10) || 3600;

class RedisService {
  constructor() {
    this.memoryCache = new Map();
    this.redisClient = null;
    this.isRedisConnected = false;
    this.initClient();
  }

  initClient() {
    // Attempt connecting to real Redis if ioredis or redis is installed
    try {
      let Redis;
      try {
        Redis = require('ioredis');
      } catch (e) {
        try {
          const redisPkg = require('redis');
          if (redisPkg.createClient) Redis = redisPkg;
        } catch (e2) {
          // Neither installed, use memory cache fallback
        }
      }

      if (Redis && typeof Redis === 'function') {
        this.redisClient = new Redis(REDIS_URL, {
          maxRetriesPerRequest: 1,
          connectTimeout: 2000,
          lazyConnect: true,
          retryStrategy(times) {
            if (times > 2) return null; // do not spam reconnects if offline
            return 1000;
          }
        });

        this.redisClient.connect().then(() => {
          this.isRedisConnected = true;
          console.log(`[Redis] Connected successfully to ${REDIS_URL}`);
        }).catch(() => {
          this.isRedisConnected = false;
        });

        this.redisClient.on('error', () => {
          this.isRedisConnected = false;
        });
      }
    } catch (err) {
      this.isRedisConnected = false;
    }
  }

  /**
   * Get cached entry by key
   */
  async get(key) {
    if (this.isRedisConnected && this.redisClient) {
      try {
        const raw = await this.redisClient.get(key);
        if (raw) {
          return JSON.parse(raw);
        }
      } catch (err) {
        // Fall back to memory cache
      }
    }

    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Store cached entry with TTL
   */
  async set(key, value, ttlSeconds = DEFAULT_TTL_SECONDS) {
    const ttl = ttlSeconds || DEFAULT_TTL_SECONDS;

    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.set(key, JSON.stringify(value), 'EX', ttl);
      } catch (err) {
        // Fall back to memory
      }
    }

    this.memoryCache.set(key, {
      value,
      expiresAt: Date.now() + (ttl * 1000)
    });

    return true;
  }

  /**
   * Delete specific key
   */
  async del(key) {
    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch (err) {}
    }
    this.memoryCache.delete(key);
    return true;
  }

  /**
   * Flush all keys matching a prefix or pattern
   */
  async flushPattern(pattern) {
    if (this.isRedisConnected && this.redisClient) {
      try {
        const keys = await this.redisClient.keys(pattern);
        if (keys && keys.length > 0) {
          await this.redisClient.del(...keys);
        }
      } catch (err) {}
    }

    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*'));
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }
    return true;
  }

  /**
   * Cache key helpers conforming to Agrinex standard
   */
  buildKey(type, params = {}) {
    const commodity = (params.commodity || 'all').toLowerCase().trim();
    if (type === 'latest') {
      return `agrinex:market:latest:${commodity}`;
    }
    if (type === 'state') {
      const state = (params.state || 'all').toLowerCase().trim();
      return `agrinex:market:state:${state}:${commodity}`;
    }
    if (type === 'district') {
      const district = (params.district || 'all').toLowerCase().trim();
      return `agrinex:market:district:${district}:${commodity}`;
    }
    if (type === 'search') {
      const serialized = JSON.stringify(params);
      return `agrinex:market:search:${Buffer.from(serialized).toString('base64')}`;
    }
    return `agrinex:market:${type}:${commodity}`;
  }

  /**
   * Status reporter
   */
  getStatus() {
    return {
      status: this.isRedisConnected ? 'CONNECTED' : 'STANDALONE_FALLBACK',
      provider: this.isRedisConnected ? 'Redis 7.x Server' : 'In-Memory Cache (TTL Engine)',
      url: this.isRedisConnected ? REDIS_URL : 'localhost memory',
      activeKeysCount: this.memoryCache.size,
      ttlSeconds: DEFAULT_TTL_SECONDS
    };
  }
}

module.exports = new RedisService();
