import { Redis } from '@upstash/redis';

// Automatically loads UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from env
export const redis = Redis.fromEnv();
