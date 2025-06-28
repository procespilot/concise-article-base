
import { describe, it, expect } from 'vitest';
import { server } from '../setup';

describe('Health API', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/health'
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('status', 'healthy');
      expect(body).toHaveProperty('timestamp');
      expect(body).toHaveProperty('uptime');
      expect(body).toHaveProperty('version');
    });
  });

  describe('GET /health/detailed', () => {
    it('should return detailed health status', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/health/detailed'
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('dependencies');
      expect(body.dependencies).toHaveProperty('supabase');
      expect(body.dependencies).toHaveProperty('redis');
    });
  });

  describe('GET /health/metrics', () => {
    it('should return system metrics', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/health/metrics'
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('memory');
      expect(body).toHaveProperty('cpu');
      expect(body).toHaveProperty('uptime');
    });
  });
});
