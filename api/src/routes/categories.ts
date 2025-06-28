
import { FastifyPluginAsync } from 'fastify';
import { categoryService } from '@/services/categoryService';
import {
  categorySchema,
  createCategorySchema,
  updateCategorySchema,
  categoryQuerySchema
} from '@/schemas/category.schema';
import { idParamSchema, paginatedResponseSchema, successResponseSchema } from '@/schemas/common.schema';

const categoriesRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /categories - List categories
  fastify.get('/', {
    schema: {
      querystring: categoryQuerySchema,
      response: {
        200: paginatedResponseSchema(categorySchema)
      }
    },
    config: {
      rateLimit: {
        max: 200,
        timeWindow: '1 minute'
      }
    }
  }, async (request, reply) => {
    const result = await categoryService.getCategories(request.query);
    return reply.send(result);
  });

  // GET /categories/:id - Get single category
  fastify.get('/:id', {
    schema: {
      params: idParamSchema,
      response: {
        200: categorySchema,
        404: { type: 'object', properties: { error: { type: 'string' } } }
      }
    }
  }, async (request, reply) => {
    const category = await categoryService.getCategoryById(request.params.id);
    
    if (!category) {
      return reply.code(404).send({ error: 'Category not found' });
    }
    
    return reply.send(category);
  });

  // POST /categories - Create new category
  fastify.post('/', {
    schema: {
      body: createCategorySchema,
      response: {
        201: categorySchema
      }
    },
    preHandler: [fastify.authenticate, fastify.requireRole('manager')]
  }, async (request, reply) => {
    const category = await categoryService.createCategory(request.body);
    return reply.code(201).send(category);
  });

  // PUT /categories/:id - Update category
  fastify.put('/:id', {
    schema: {
      params: idParamSchema,
      body: updateCategorySchema,
      response: {
        200: categorySchema
      }
    },
    preHandler: [fastify.authenticate, fastify.requireRole('manager')]
  }, async (request, reply) => {
    const category = await categoryService.updateCategory(request.params.id, request.body);
    return reply.send(category);
  });

  // DELETE /categories/:id - Delete category
  fastify.delete('/:id', {
    schema: {
      params: idParamSchema,
      response: {
        200: successResponseSchema
      }
    },
    preHandler: [fastify.authenticate, fastify.requireRole('manager')]
  }, async (request, reply) => {
    await categoryService.deleteCategory(request.params.id);
    return reply.send({ success: true, message: 'Category deleted successfully' });
  });
};

export default categoriesRoutes;
