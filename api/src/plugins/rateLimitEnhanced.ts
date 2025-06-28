
import { FastifyPluginAsync } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import Redis from 'ioredis';
import { env } from '@/config/env';

const rateLimitEnhancedPlugin: FastifyPluginAsync = async (fastify) => {
  let redis: Redis | undefined;
  
  // Use Redis if available, otherwise fall back to memory
  if (env.REDIS_URL) {
    redis = new Redis(env.REDIS_URL);
  }

  // General rate limiting
  await fastify.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW,
    redis: redis,
    keyGenerator: (request) => {
      // Rate limit by user ID if authenticated, otherwise by IP
      const user = request.user;
      if (user && !user.isApiKey) {
        return `general:user:${user.id}`;
      }
      return `general:ip:${request.ip}`;
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

  // Specific rate limiting for article creation (5 articles per hour per user)
  const articleCreationRateLimit = rateLimit({
    max: 5,
    timeWindow: '1 hour',
    redis: redis,
    keyGenerator: (request) => {
      const user = request.user;
      if (user && !user.isApiKey) {
        return `article_creation:user:${user.id}`;
      }
      return `article_creation:ip:${request.ip}`;
    },
    errorResponseBuilder: (request, context) => {
      return {
        error: 'Article creation rate limit exceeded',
        message: 'You can only create 5 articles per hour. Please try again later.',
        retryAfter: context.ttl
      };
    }
  });

  // Register the article creation rate limit
  fastify.register(async function (fastify) {
    fastify.addHook('onRequest', async (request, reply) => {
      if (request.method === 'POST' && request.url === '/api/articles') {
        await articleCreationRateLimit(request, reply);
      }
    });
  });

  // High-frequency endpoints rate limiting (like view increments)
  const highFrequencyRateLimit = rateLimit({
    max: 50,
    timeWindow: '1 minute',
    redis: redis,
    keyGenerator: (request) => {
      const user = request.user;
      if (user && !user.isApiKey) {
        return `high_freq:user:${user.id}`;
      }
      return `high_freq:ip:${request.ip}`;
    }
  });

  // Register high-frequency rate limit for view endpoints
  fastify.register(async function (fastify) {
    fastify.addHook('onRequest', async (request, reply) => {
      if (request.url.includes('/view') && request.method === 'POST') {
        await highFrequencyRateLimit(request, reply);
      }
    });
  });
};

export default rateLimitEnhancedPlugin;
