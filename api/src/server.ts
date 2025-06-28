
import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { env, isDevelopment } from '@/config/env';

// Import plugins
import authPlugin from '@/plugins/auth';
import rateLimitPlugin from '@/plugins/rateLimit';
import errorHandlerPlugin from '@/plugins/errorHandler';

// Import routes
import articlesRoutes from '@/routes/articles';
import categoriesRoutes from '@/routes/categories';
import usersRoutes from '@/routes/users';
import healthRoutes from '@/routes/health';

const server = Fastify({
  logger: {
    level: env.LOG_LEVEL,
    ...(isDevelopment && { prettyPrint: true })
  }
});

async function buildServer() {
  try {
    // Security plugins
    await server.register(helmet, {
      contentSecurityPolicy: false // Disable for Swagger UI
    });

    await server.register(cors, {
      origin: env.CORS_ORIGINS,
      credentials: true
    });

    // API Documentation
    await server.register(swagger, {
      openapi: {
        info: {
          title: 'ClearBase API Gateway',
          description: 'Production-ready API Gateway for ClearBase knowledge platform',
          version: '1.0.0'
        },
        servers: [
          {
            url: isDevelopment ? `http://localhost:${env.PORT}` : 'https://api.clearbase.com',
            description: isDevelopment ? 'Development server' : 'Production server'
          }
        ],
        components: {
          securitySchemes: {
            ApiKey: {
              type: 'apiKey',
              in: 'header',
              name: 'x-api-key'
            },
            BearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT'
            }
          }
        },
        security: [
          { ApiKey: [] },
          { BearerAuth: [] }
        ]
      }
    });

    if (isDevelopment) {
      await server.register(swaggerUi, {
        routePrefix: '/docs',
        uiConfig: {
          docExpansion: 'full',
          deepLinking: false
        }
      });
    }

    // Core plugins
    await server.register(errorHandlerPlugin);
    await server.register(rateLimitPlugin);
    await server.register(authPlugin);

    // Routes
    await server.register(healthRoutes, { prefix: '/health' });
    await server.register(articlesRoutes, { prefix: '/api/articles' });
    await server.register(categoriesRoutes, { prefix: '/api/categories' });
    await server.register(usersRoutes, { prefix: '/api/users' });

    // Root endpoint
    server.get('/', async (request, reply) => {
      return {
        name: 'ClearBase API Gateway',
        version: '1.0.0',
        status: 'running',
        documentation: isDevelopment ? `${request.protocol}://${request.hostname}:${env.PORT}/docs` : undefined
      };
    });

    return server;
  } catch (error) {
    server.log.error('Error building server:', error);
    throw error;
  }
}

async function start() {
  try {
    const app = await buildServer();
    
    await app.listen({
      host: env.HOST,
      port: env.PORT
    });

    app.log.info(`🚀 ClearBase API Gateway started on http://${env.HOST}:${env.PORT}`);
    
    if (isDevelopment) {
      app.log.info(`📚 API Documentation available at http://${env.HOST}:${env.PORT}/docs`);
    }

    // Graceful shutdown
    const signals = ['SIGINT', 'SIGTERM'];
    signals.forEach(signal => {
      process.on(signal, async () => {
        app.log.info(`Received ${signal}, shutting down gracefully...`);
        await app.close();
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start server if this file is run directly
if (require.main === module) {
  start();
}

export { buildServer, start };
export default server;
