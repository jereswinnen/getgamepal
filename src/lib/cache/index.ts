import NodeCache from "node-cache";
import { createClient } from "redis";
import { promises as fs } from "fs";
import path from "path";

// Cache duration in seconds (30 minutes)
export const CACHE_DURATION = 30 * 60; // 24 * 60 * 60 (24 hours)

// Initialize in-memory cache
const memoryCache = new NodeCache({
  stdTTL: CACHE_DURATION,
  checkperiod: 60 * 60, // Check for expired keys every hour
});

// Redis client setup
let redisClient: ReturnType<typeof createClient> | null = null;
let redisConnected = false;

// Initialize Redis client if REDIS_URL is provided
const initRedis = async () => {
  if (process.env.REDIS_URL) {
    try {
      redisClient = createClient({
        url: process.env.REDIS_URL,
      });

      redisClient.on("error", (err) => {
        console.error("Redis error:", err);
        redisConnected = false;
      });

      await redisClient.connect();
      redisConnected = true;
      console.log("Redis connected successfully");
    } catch (error) {
      console.error("Failed to connect to Redis:", error);
      redisConnected = false;
    }
  }
};

// Initialize Redis on module load
initRedis();

// Cache statistics
const cacheStats = {
  hits: 0,
  misses: 0,
  lastRefresh: new Date().toISOString(),
};

// File cache helpers
const FILE_CACHE_DIR = path.join(process.cwd(), ".cache");

const ensureCacheDir = async () => {
  try {
    await fs.mkdir(FILE_CACHE_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creating cache directory:", error);
  }
};

const getFileCachePath = (key: string) => {
  return path.join(FILE_CACHE_DIR, `${key.replace(/[^a-z0-9]/gi, "_")}.json`);
};

// Cache interface
export interface CacheManager {
  get: <T>(key: string) => Promise<T | null>;
  set: <T>(key: string, data: T) => Promise<void>;
  clear: () => Promise<void>;
  delete: (key: string) => Promise<void>;
  keys: () => Promise<string[]>;
  getStats: () => typeof cacheStats;
}

// Cache implementation
export const cacheManager: CacheManager = {
  get: async <T>(key: string): Promise<T | null> => {
    // Try memory cache first
    const memData = memoryCache.get<T>(key);
    if (memData !== undefined) {
      cacheStats.hits++;
      return memData;
    }

    // Try Redis cache if available
    if (redisConnected && redisClient) {
      try {
        const redisData = await redisClient.get(key);
        if (redisData) {
          const data = JSON.parse(redisData) as T;
          // Update memory cache
          memoryCache.set(key, data);
          cacheStats.hits++;
          return data;
        }
      } catch (error) {
        console.error("Redis get error:", error);
      }
    }

    // Try file cache as last resort
    try {
      await ensureCacheDir();
      const filePath = getFileCachePath(key);
      const fileData = await fs.readFile(filePath, "utf-8");
      const data = JSON.parse(fileData) as T;
      // Update memory cache
      memoryCache.set(key, data);
      cacheStats.hits++;
      return data;
    } catch (error) {
      // File doesn't exist or other error
      cacheStats.misses++;
      return null;
    }
  },

  set: async <T>(key: string, data: T): Promise<void> => {
    // Set in memory cache
    memoryCache.set(key, data);

    // Set in Redis if available
    if (redisConnected && redisClient) {
      try {
        await redisClient.set(key, JSON.stringify(data), {
          EX: CACHE_DURATION,
        });
      } catch (error) {
        console.error("Redis set error:", error);
      }
    }

    // Always set in file cache as backup
    try {
      await ensureCacheDir();
      const filePath = getFileCachePath(key);
      await fs.writeFile(filePath, JSON.stringify(data), "utf-8");
    } catch (error) {
      console.error("File cache set error:", error);
    }

    // Update refresh timestamp
    cacheStats.lastRefresh = new Date().toISOString();
  },

  delete: async (key: string): Promise<void> => {
    // Delete from memory cache
    memoryCache.del(key);

    // Delete from Redis if available
    if (redisConnected && redisClient) {
      try {
        await redisClient.del(key);
      } catch (error) {
        console.error("Redis delete error:", error);
      }
    }

    // Delete from file cache
    try {
      await ensureCacheDir();
      const filePath = getFileCachePath(key);
      await fs.unlink(filePath).catch(() => {}); // Ignore if file doesn't exist
    } catch (error) {
      console.error("File cache delete error:", error);
    }
  },

  keys: async (): Promise<string[]> => {
    // Get keys from memory cache
    const memKeys = memoryCache.keys();

    // Return memory cache keys
    return memKeys;
  },

  clear: async (): Promise<void> => {
    // Clear memory cache
    memoryCache.flushAll();

    // Clear Redis cache if available
    if (redisConnected && redisClient) {
      try {
        await redisClient.flushDb();
      } catch (error) {
        console.error("Redis flush error:", error);
      }
    }

    // Clear file cache
    try {
      await ensureCacheDir();
      const files = await fs.readdir(FILE_CACHE_DIR);
      for (const file of files) {
        if (file.endsWith(".json")) {
          await fs.unlink(path.join(FILE_CACHE_DIR, file));
        }
      }
    } catch (error) {
      console.error("File cache clear error:", error);
    }

    // Reset stats
    cacheStats.hits = 0;
    cacheStats.misses = 0;
    cacheStats.lastRefresh = new Date().toISOString();
  },

  getStats: () => {
    return { ...cacheStats };
  },
};
