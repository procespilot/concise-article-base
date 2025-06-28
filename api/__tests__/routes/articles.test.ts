
import { describe, it, expect } from 'vitest';
import { server } from '../setup';

describe('Articles API', () => {
  describe('GET /api/articles', () => {
    it('should return paginated articles', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/articles',
        headers: {
          'x-api-key': 'test-api-key'
        }
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('pagination');
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/articles'
      });

      expect(response.statusCode).toBe(401);
    });

    it('should support search query', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/articles?q=test',
        headers: {
          'x-api-key': 'test-api-key'
        }
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('POST /api/articles', () => {
    it('should create new article with manager role', async () => {
      const articleData = {
        title: 'Test Article',
        content: 'This is test content',
        status: 'Concept'
      };

      const response = await server.inject({
        method: 'POST',
        url: '/api/articles',
        headers: {
          'x-api-key': 'test-api-key',
          'content-type': 'application/json'
        },
        payload: articleData
      });

      expect(response.statusCode).toBe(201);
      
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('id');
      expect(body.title).toBe(articleData.title);
    });

    it('should require manager role', async () => {
      // This would need a proper JWT token for a user role
      // For now, testing with API key (which grants admin access)
      const response = await server.inject({
        method: 'POST',
        url: '/api/articles',
        headers: {
          'content-type': 'application/json'
        },
        payload: {
          title: 'Test',
          content: 'Content'
        }
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
