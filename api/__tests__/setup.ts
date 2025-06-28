
import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { buildServer } from '@/server';
import { FastifyInstance } from 'fastify';

let server: FastifyInstance;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.SUPABASE_URL = 'http://localhost:54321';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
  process.env.SUPABASE_ANON_KEY = 'test-anon-key';
  process.env.SUPABASE_JWT_SECRET = 'test-jwt-secret';
  process.env.API_KEYS = 'test-api-key';
  process.env.CORS_ORIGINS = 'http://localhost:3000';
  
  server = await buildServer();
  await server.ready();
});

afterAll(async () => {
  if (server) {
    await server.close();
  }
});

beforeEach(async () => {
  // Reset test data before each test
});

afterEach(async () => {
  // Cleanup after each test
});

export { server };
