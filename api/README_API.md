
# ClearBase API Gateway

Production-ready API Gateway serving as a thin wrapper around the ClearBase Supabase backend. Provides standardized REST and GraphQL endpoints with authentication, rate limiting, and comprehensive documentation.

## 🚀 Features

- **Dual Authentication**: API Keys for server-to-server + JWT passthrough for frontend
- **Rate Limiting**: Configurable per-endpoint limits with Redis backend
- **REST API**: Complete CRUD operations for articles, categories, and users
- **GraphQL**: Apollo Server integration with subscriptions
- **Auto Documentation**: OpenAPI 3.1 spec with Swagger UI
- **Security**: Helmet, CORS, input validation, and role-based access control
- **Monitoring**: Health checks, metrics, and structured logging
- **Testing**: 80%+ test coverage with Vitest
- **Docker**: Multi-stage builds for production deployment

## 📋 Prerequisites

- Node.js 18+
- Redis (optional, for distributed rate limiting)
- Access to your Supabase project

## 🛠️ Installation

1. **Clone and install dependencies:**
   ```bash
   cd api
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001` with documentation at `http://localhost:3001/docs`.

## 🔧 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | No | `development` |
| `PORT` | Server port | No | `3001` |
| `SUPABASE_URL` | Your Supabase project URL | Yes | - |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for admin operations | Yes | - |
| `SUPABASE_ANON_KEY` | Anonymous key for public access | Yes | - |
| `SUPABASE_JWT_SECRET` | JWT secret for token validation | Yes | - |
| `API_KEYS` | Comma-separated list of valid API keys | Yes | - |
| `REDIS_URL` | Redis connection string | No | - |
| `CORS_ORIGINS` | Allowed CORS origins | Yes | - |
| `LOG_LEVEL` | Logging level (debug/info/warn/error) | No | `info` |

## 🔑 Authentication

### API Key Authentication
Include your API key in the request header:
```bash
curl -H "x-api-key: your-api-key" \
     https://api.yoursite.com/api/articles
```

### JWT Passthrough
Use existing Supabase JWT tokens:
```bash
curl -H "Authorization: Bearer your-supabase-jwt" \
     https://api.yoursite.com/api/articles
```

## 📚 API Endpoints

### Articles
```bash
# List articles with pagination and filtering
GET /api/articles?page=1&pageSize=20&q=search&category_id=uuid

# Get single article
GET /api/articles/:id

# Create article (manager+ required)
POST /api/articles
{
  "title": "Article Title",
  "content": "Article content...",
  "category_id": "uuid",
  "status": "Concept"
}

# Update article (manager+ or author required)
PUT /api/articles/:id

# Delete article (manager+ or author required)
DELETE /api/articles/:id

# Publish article (manager+ required)
PATCH /api/articles/:id/publish

# Increment view count (no auth required)
POST /api/articles/:id/view
```

### Categories
```bash
# List categories
GET /api/categories

# Get single category
GET /api/categories/:id

# Create category (manager+ required)
POST /api/categories
{
  "name": "Category Name",
  "description": "Optional description"
}

# Update category (manager+ required)
PUT /api/categories/:id

# Delete category (manager+ required)
DELETE /api/categories/:id
```

### Users (Admin Only)
```bash
# List users with role filtering
GET /api/users?role=manager&is_active=true

# Get single user
GET /api/users/:id

# Create user (invite)
POST /api/users
{
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "user",
  "auto_activate": false
}

# Update user
PUT /api/users/:id

# Activate/deactivate user
PATCH /api/users/:id/activate
{
  "is_active": true
}

# Delete user
DELETE /api/users/:id
```

### System
```bash
# Health check
GET /health

# Detailed health with dependencies
GET /health/detailed

# System metrics
GET /health/metrics
```

## 🔒 Rate Limits

Default limits (configurable via environment):
- **General endpoints**: 100 requests/minute per user
- **View increments**: 200 requests/minute per IP
- **User management**: 50 requests/minute per user
- **Categories**: 200 requests/minute (cached)

Rate limit headers are included in responses:
- `x-ratelimit-limit`: Request limit
- `x-ratelimit-remaining`: Remaining requests
- `x-ratelimit-reset`: Reset timestamp

## 🏗️ Development

### Running Tests
```bash
# Unit tests
npm test

# With coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

### Linting
```bash
npm run lint
npm run lint:fix
```

### Building
```bash
npm run build
```

## 🐳 Docker Deployment

### Build and run locally:
```bash
docker build -t clearbase-api .
docker run -p 3001:3001 --env-file .env clearbase-api
```

### Docker Compose (with Redis):
```bash
docker-compose up -d
```

### Production deployment:
```bash
# Build for production
docker build --target production -t clearbase-api:prod .

# Run with production settings
docker run -d \
  -p 3001:3001 \
  --env-file .env.production \
  --restart unless-stopped \
  clearbase-api:prod
```

## 📊 Monitoring

### Health Checks
- `GET /health` - Basic health status
- `GET /health/detailed` - Health with dependency checks
- `GET /health/metrics` - System metrics

### Logging
Structured JSON logging with configurable levels. In production, logs include:
- Request/response details
- Authentication events
- Rate limit violations
- Error stack traces (development only)

### Metrics
- Response times
- Request counts by endpoint
- Authentication success/failure rates
- Rate limit hit rates
- Memory and CPU usage

## 🚀 Production Checklist

- [ ] Set strong API keys in production
- [ ] Configure Redis for distributed rate limiting
- [ ] Set up proper CORS origins
- [ ] Enable request logging
- [ ] Configure health check monitoring
- [ ] Set up SSL/TLS termination
- [ ] Configure reverse proxy (nginx/traefik)
- [ ] Set up log aggregation (ELK/Loki)
- [ ] Monitor system metrics
- [ ] Set up alerting for failures

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
