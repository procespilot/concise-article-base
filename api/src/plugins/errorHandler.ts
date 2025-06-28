
import { FastifyPluginAsync, FastifyError } from 'fastify';
import { ZodError } from 'zod';

const errorHandlerPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.setErrorHandler(async (error: FastifyError, request, reply) => {
    fastify.log.error(error);

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return reply.code(400).send({
        error: 'Validation failed',
        details: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      });
    }

    // Handle Fastify validation errors
    if (error.validation) {
      return reply.code(400).send({
        error: 'Validation failed',
        details: error.validation
      });
    }

    // Handle rate limit errors
    if (error.statusCode === 429) {
      return reply.code(429).send({
        error: 'Rate limit exceeded',
        message: error.message
      });
    }

    // Handle authentication errors
    if (error.statusCode === 401) {
      return reply.code(401).send({
        error: 'Authentication failed',
        message: error.message
      });
    }

    // Handle authorization errors
    if (error.statusCode === 403) {
      return reply.code(403).send({
        error: 'Authorization failed',
        message: error.message
      });
    }

    // Handle not found errors
    if (error.statusCode === 404) {
      return reply.code(404).send({
        error: 'Resource not found',
        message: error.message
      });
    }

    // Handle server errors
    const statusCode = error.statusCode || 500;
    
    return reply.code(statusCode).send({
      error: statusCode >= 500 ? 'Internal server error' : error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  });

  // Handle 404 for unmatched routes
  fastify.setNotFoundHandler(async (request, reply) => {
    return reply.code(404).send({
      error: 'Route not found',
      message: `Route ${request.method} ${request.url} not found`
    });
  });
};

export default errorHandlerPlugin;
