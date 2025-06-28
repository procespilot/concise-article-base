
import { FastifyPluginAsync } from 'fastify';
import { articleServiceSecure } from '@/services/articleServiceSecure';
import {
  articleSchema,
  createArticleSchema,
  updateArticleSchema,
  articleQuerySchema,
} from '@/schemas/article.schema';
import { idParamSchema, paginatedResponseSchema, successResponseSchema } from '@/schemas/common.schema';

const articlesSecureRoutes: FastifyPluginAsync = async (fastify) => {
  // Request size limits
  const maxBodySize = 1024 * 1024; // 1MB limit for request bodies

  // GET /articles - List articles with filtering and pagination
  fastify.get('/', {
    schema: {
      querystring: articleQuerySchema,
      response: {
        200: paginatedResponseSchema(articleSchema)
      }
    },
    preHandler: [fastify.authenticate],
    config: {
      rateLimit: {
        max: 100,
        timeWindow: '1 minute'
      }
    }
  }, async (request, reply) => {
    try {
      const result = await articleServiceSecure.searchArticles(request.query, request.user);
      return reply.send(result);
    } catch (error) {
      fastify.log.error('Search articles error:', error);
      return reply.code(500).send({ 
        error: 'Internal server error',
        message: 'Failed to fetch articles'
      });
    }
  });

  // GET /articles/:id - Get single article
  fastify.get('/:id', {
    schema: {
      params: idParamSchema,
      response: {
        200: articleSchema,
        404: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate],
    config: {
      rateLimit: {
        max: 200,
        timeWindow: '1 minute'
      }
    }
  }, async (request, reply) => {
    try {
      const article = await articleServiceSecure.getArticleById(request.params.id, request.user);
      
      if (!article) {
        return reply.code(404).send({ error: 'Article not found' });
      }
      
      return reply.send(article);
    } catch (error) {
      fastify.log.error('Get article error:', error);
      
      if (error.message.includes('Invalid article ID')) {
        return reply.code(400).send({ error: 'Invalid article ID format' });
      }
      
      return reply.code(500).send({ 
        error: 'Internal server error',
        message: 'Failed to fetch article'
      });
    }
  });

  // POST /articles - Create new article
  fastify.post('/', {
    schema: {
      body: createArticleSchema,
      response: {
        201: articleSchema,
        400: { type: 'object', properties: { error: { type: 'string' }, details: { type: 'array' } } },
        429: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate, fastify.requireRole('manager')],
    bodyLimit: maxBodySize,
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 hour',
        keyGenerator: (request) => `article_creation:${request.user?.id || request.ip}`
      }
    }
  }, async (request, reply) => {
    try {
      const article = await articleServiceSecure.createArticle(request.body, request.user!.id);
      return reply.code(201).send(article);
    } catch (error) {
      fastify.log.error('Create article error:', error);
      
      if (error.message.includes('validation') || error.message.includes('Invalid')) {
        return reply.code(400).send({ 
          error: 'Validation error',
          message: error.message
        });
      }
      
      return reply.code(500).send({ 
        error: 'Internal server error',
        message: 'Failed to create article'
      });
    }
  });

  // PUT /articles/:id - Update article
  fastify.put('/:id', {
    schema: {
      params: idParamSchema,
      body: updateArticleSchema,
      response: {
        200: articleSchema,
        400: { type: 'object', properties: { error: { type: 'string' } } },
        403: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate, fastify.requireRole('manager')],
    bodyLimit: maxBodySize,
    config: {
      rateLimit: {
        max: 20,
        timeWindow: '1 hour'
      }
    }
  }, async (request, reply) => {
    try {
      const article = await articleServiceSecure.updateArticle(
        request.params.id, 
        request.body, 
        request.user!
      );
      return reply.send(article);
    } catch (error) {
      fastify.log.error('Update article error:', error);
      
      if (error.message.includes('Invalid article ID')) {
        return reply.code(400).send({ error: 'Invalid article ID format' });
      }
      
      if (error.message.includes('Insufficient permissions')) {
        return reply.code(403).send({ error: 'Insufficient permissions' });
      }
      
      return reply.code(500).send({ 
        error: 'Internal server error',
        message: 'Failed to update article'
      });
    }
  });

  // DELETE /articles/:id - Delete article
  fastify.delete('/:id', {
    schema: {
      params: idParamSchema,
      response: {
        200: successResponseSchema,
        400: { type: 'object', properties: { error: { type: 'string' } } },
        403: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate, fastify.requireRole('manager')],
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 hour'
      }
    }
  }, async (request, reply) => {
    try {
      await articleServiceSecure.deleteArticle(request.params.id, request.user!);
      return reply.send({ success: true, message: 'Article deleted successfully' });
    } catch (error) {
      fastify.log.error('Delete article error:', error);
      
      if (error.message.includes('Invalid article ID')) {
        return reply.code(400).send({ error: 'Invalid article ID format' });
      }
      
      if (error.message.includes('Insufficient permissions')) {
        return reply.code(403).send({ error: 'Insufficient permissions' });
      }
      
      return reply.code(500).send({ 
        error: 'Internal server error',
        message: 'Failed to delete article'
      });
    }
  });

  // PATCH /articles/:id/publish - Publish article
  fastify.patch('/:id/publish', {
    schema: {
      params: idParamSchema,
      response: {
        200: articleSchema,
        400: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate, fastify.requireRole('manager')],
    config: {
      rateLimit: {
        max: 20,
        timeWindow: '1 hour'
      }
    }
  }, async (request, reply) => {
    try {
      const article = await articleServiceSecure.publishArticle(request.params.id);
      return reply.send(article);
    } catch (error) {
      fastify.log.error('Publish article error:', error);
      
      if (error.message.includes('Invalid article ID')) {
        return reply.code(400).send({ error: 'Invalid article ID format' });
      }
      
      return reply.code(500).send({ 
        error: 'Internal server error',
        message: 'Failed to publish article'
      });
    }
  });

  // POST /articles/:id/view - Increment view count
  fastify.post('/:id/view', {
    schema: {
      params: idParamSchema,
      response: {
        200: successResponseSchema,
        400: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    config: {
      rateLimit: {
        max: 50,
        timeWindow: '1 minute'
      }
    }
  }, async (request, reply) => {
    try {
      await articleServiceSecure.incrementViews(request.params.id);
      return reply.send({ success: true, message: 'View count incremented' });
    } catch (error) {
      fastify.log.error('Increment views error:', error);
      
      if (error.message.includes('Invalid article ID')) {
        return reply.code(400).send({ error: 'Invalid article ID format' });
      }
      
      // Don't return error for view increment failures - it's non-critical
      return reply.send({ success: true, message: 'View count increment attempted' });
    }
  });
};

export default articlesSecureRoutes;
