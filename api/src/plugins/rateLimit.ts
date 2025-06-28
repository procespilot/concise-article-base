
import { FastifyPluginAsync } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import Redis from 'ioredis';
import { env } from '@/config/env';

const rateLimitPlugin: FastifyPluginAsync = async (fastify) => {
  let redis: Redis | undefined;
  
  // Use Redis if available, otherwise fall back to memory
  if (env.REDIS_URL) {
    redis = new Redis(env.REDIS_URL);
  }

  await fastify.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW,
    redis: redis,
    keyGenerator: (request) => {
      // Rate limit by user ID if authenticated, otherwise by IP
      const user = request.user;
      if (user && !user.isApiKey) {
        return `user:${user.id}`;
      }
      return `ip:${request.ip}`;
    },
    errorResponseBuilder: (request, context) => {
      return {
        error: 'Rate limit exceeded',
        message: `Too many requests. Try again in ${Math.round(context.ttl / 1000)} seconds.`,
        retryAfter: context.ttl
      };
    },
    enableDraftSpec: true,
    addHeadersOnExceeding: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true
    },
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true
    }
  });
};

export default rateLimitPlugin;
