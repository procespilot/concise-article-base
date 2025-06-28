
import { FastifyPluginAsync } from 'fastify';
import { articleService } from '@/services/articleService';
import {
  articleSchema,
  createArticleSchema,
  updateArticleSchema,
  articleQuerySchema,
  publishArticleSchema
} from '@/schemas/article.schema';
import { idParamSchema, paginatedResponseSchema, successResponseSchema } from '@/schemas/common.schema';

const articlesRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /articles - List articles with filtering and pagination
  fastify.get('/', {
    schema: {
      querystring: articleQuerySchema,
      response: {
        200: paginatedResponseSchema(articleSchema)
      }
    },
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const result = await articleService.searchArticles(request.query, request.user);
    return reply.send(result);
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
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const article = await articleService.getArticleById(request.params.id, request.user);
    
    if (!article) {
      return reply.code(404).send({ error: 'Article not found' });
    }
    
    return reply.send(article);
  });

  // POST /articles - Create new article
  fastify.post('/', {
    schema: {
      body: createArticleSchema,
      response: {
        201: articleSchema
      }
    },
    preHandler: [fastify.authenticate, fastify.requireRole('manager')]
  }, async (request, reply) => {
    const article = await articleService.createArticle(request.body, request.user!.id);
    return reply.code(201).send(article);
  });

  // PUT /articles/:id - Update article
  fastify.put('/:id', {
    schema: {
      params: idParamSchema,
      body: updateArticleSchema,
      response: {
        200: articleSchema
      }
    },
    preHandler: [fastify.authenticate, fastify.requireRole('manager')]
  }, async (request, reply) => {
    const article = await articleService.updateArticle(
      request.params.id, 
      request.body, 
      request.user!
    );
    return reply.send(article);
  });

  // DELETE /articles/:id - Delete article
  fastify.delete('/:id', {
    schema: {
      params: idParamSchema,
      response: {
        200: successResponseSchema
      }
    },
    preHandler: [fastify.authenticate, fastify.requireRole('manager')]
  }, async (request, reply) => {
    await articleService.deleteArticle(request.params.id, request.user!);
    return reply.send({ success: true, message: 'Article deleted successfully' });
  });

  // PATCH /articles/:id/publish - Publish article
  fastify.patch('/:id/publish', {
    schema: {
      params: idParamSchema,
      response: {
        200: articleSchema
      }
    },
    preHandler: [fastify.authenticate, fastify.requireRole('manager')]
  }, async (request, reply) => {
    const article = await articleService.publishArticle(request.params.id);
    return reply.send(article);
  });

  // POST /articles/:id/view - Increment view count
  fastify.post('/:id/view', {
    schema: {
      params: idParamSchema,
      response: {
        200: successResponseSchema
      }
    },
    config: {
      rateLimit: {
        max: 50,
        timeWindow: '1 minute'
      }
    }
  }, async (request, reply) => {
    await articleService.incrementViews(request.params.id);
    return reply.send({ success: true, message: 'View count incremented' });
  });
};

export default articlesRoutes;
