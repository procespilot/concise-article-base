
import { FastifyPluginAsync } from 'fastify';
import { userService } from '@/services/userService';
import {
  userSchema,
  createUserSchema,
  updateUserSchema,
  userQuerySchema,
  activateUserSchema
} from '@/schemas/user.schema';
import { idParamSchema, paginatedResponseSchema, successResponseSchema } from '@/schemas/common.schema';

const usersRoutes: FastifyPluginAsync = async (fastify) => {
  // All user routes require admin access
  fastify.addHook('preHandler', fastify.authenticate);
  fastify.addHook('preHandler', fastify.requireRole('admin'));

  // GET /users - List users (admin only)
  fastify.get('/', {
    schema: {
      querystring: userQuerySchema,
      response: {
        200: paginatedResponseSchema(userSchema)
      }
    },
    config: {
      rateLimit: {
        max: 50,
        timeWindow: '1 minute'
      }
    }
  }, async (request, reply) => {
    const result = await userService.getUsers(request.query);
    return reply.send(result);
  });

  // GET /users/:id - Get single user
  fastify.get('/:id', {
    schema: {
      params: idParamSchema,
      response: {
        200: userSchema,
        404: { type: 'object', properties: { error: { type: 'string' } } }
      }
    }
  }, async (request, reply) => {
    const user = await userService.getUserById(request.params.id);
    
    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }
    
    return reply.send(user);
  });

  // POST /users - Create new user (invite)
  fastify.post('/', {
    schema: {
      body: createUserSchema,
      response: {
        201: { type: 'object', properties: { success: { type: 'boolean' }, user_id: { type: 'string' } } }
      }
    }
  }, async (request, reply) => {
    const result = await userService.createUser(request.body);
    return reply.code(201).send(result);
  });

  // PUT /users/:id - Update user
  fastify.put('/:id', {
    schema: {
      params: idParamSchema,
      body: updateUserSchema,
      response: {
        200: userSchema
      }
    }
  }, async (request, reply) => {
    const user = await userService.updateUser(request.params.id, request.body);
    return reply.send(user);
  });

  // PATCH /users/:id/activate - Activate/deactivate user
  fastify.patch('/:id/activate', {
    schema: {
      params: idParamSchema,
      body: activateUserSchema,
      response: {
        200: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } }
      }
    }
  }, async (request, reply) => {
    const result = await userService.activateUser(request.params.id, request.body.is_active);
    return reply.send(result);
  });

  // DELETE /users/:id - Delete user
  fastify.delete('/:id', {
    schema: {
      params: idParamSchema,
      response: {
        200: successResponseSchema
      }
    }
  }, async (request, reply) => {
    await userService.deleteUser(request.params.id);
    return reply.send({ success: true, message: 'User deleted successfully' });
  });
};

export default usersRoutes;
