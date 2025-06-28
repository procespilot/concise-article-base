
import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { supabaseAdmin } from '@/config/supabase';
import { UserRole } from '@/schemas/common.schema';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  isApiKey: boolean;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}

const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const apiKey = request.headers['x-api-key'] as string;
      const authHeader = request.headers.authorization as string;

      // Strategy 1: API Key authentication
      if (apiKey) {
        if (!env.API_KEYS.includes(apiKey)) {
          return reply.code(401).send({ error: 'Invalid API key' });
        }
        
        // API key grants admin access
        request.user = {
          id: 'api-key-user',
          email: 'api@system.local',
          role: 'admin',
          isApiKey: true
        };
        return;
      }

      // Strategy 2: JWT passthrough
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        try {
          const payload = jwt.verify(token, env.SUPABASE_JWT_SECRET) as any;
          
          // Fetch user profile and role from Supabase
          const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select(`
              id,
              email,
              first_name,
              last_name,
              is_active,
              user_roles(role)
            `)
            .eq('id', payload.sub)
            .single();

          if (error || !profile || !profile.is_active) {
            return reply.code(401).send({ error: 'User not found or inactive' });
          }

          const role = profile.user_roles?.[0]?.role || 'user';

          request.user = {
            id: profile.id,
            email: profile.email || '',
            role: role as UserRole,
            isApiKey: false
          };
          return;
        } catch (jwtError) {
          return reply.code(401).send({ error: 'Invalid JWT token' });
        }
      }

      return reply.code(401).send({ error: 'Authentication required' });
    } catch (error) {
      fastify.log.error('Authentication error:', error);
      return reply.code(500).send({ error: 'Authentication failed' });
    }
  });

  fastify.decorate('requireRole', (minRole: UserRole) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.user) {
        return reply.code(401).send({ error: 'Authentication required' });
      }

      const roleHierarchy: UserRole[] = ['user', 'manager', 'admin'];
      const userRoleIndex = roleHierarchy.indexOf(request.user.role);
      const requiredRoleIndex = roleHierarchy.indexOf(minRole);

      if (userRoleIndex < requiredRoleIndex) {
        return reply.code(403).send({ error: 'Insufficient permissions' });
      }
    };
  });
};

export default authPlugin;
