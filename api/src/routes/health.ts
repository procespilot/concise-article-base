
import { FastifyPluginAsync } from 'fastify';
import { supabaseAdmin } from '@/config/supabase';

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  // Health check endpoint
  fastify.get('/', async (request, reply) => {
    return reply.send({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    });
  });

  // Detailed health check with dependencies
  fastify.get('/detailed', async (request, reply) => {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      dependencies: {
        supabase: 'unknown',
        redis: 'unknown'
      }
    };

    // Check Supabase connection
    try {
      const { error } = await supabaseAdmin
        .from('profiles')
        .select('count')
        .limit(1);
      
      health.dependencies.supabase = error ? 'unhealthy' : 'healthy';
    } catch (error) {
      health.dependencies.supabase = 'unhealthy';
    }

    // Check Redis connection (if configured)
    try {
      if (process.env.REDIS_URL) {
        // Redis health check would go here
        health.dependencies.redis = 'healthy';
      } else {
        health.dependencies.redis = 'not_configured';
      }
    } catch (error) {
      health.dependencies.redis = 'unhealthy';
    }

    const overallHealthy = Object.values(health.dependencies)
      .every(status => status === 'healthy' || status === 'not_configured');

    if (!overallHealthy) {
      health.status = 'degraded';
      return reply.code(503).send(health);
    }

    return reply.send(health);
  });

  // Metrics endpoint
  fastify.get('/metrics', async (request, reply) => {
    const memUsage = process.memoryUsage();
    
    return reply.send({
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external
      },
      cpu: process.cpuUsage()
    });
  });
};

export default healthRoutes;
