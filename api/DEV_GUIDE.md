
# ClearBase API - Development Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Redis (voor rate limiting en caching)
- Docker (optioneel)

### Setup
```bash
cd api
npm install
cp .env.dev .env
npm run dev
```

De API draait op: `http://localhost:3001`
- Swagger UI: `http://localhost:3001/docs`
- Health Check: `http://localhost:3001/health`

## 🔑 API Keys voor Development

### Standaard Development Keys
```
Manager Key: dev-manager-key-2024
Admin Key: dev-admin-key-2024
Test Key: test-integration-key
```

### API Key Gebruik
```bash
# Artikelen ophalen
curl -H "x-api-key: dev-manager-key-2024" \
     http://localhost:3001/api/articles

# Artikel aanmaken
curl -X POST \
     -H "x-api-key: dev-manager-key-2024" \
     -H "Content-Type: application/json" \
     -d '{"title":"Test Artikel","content":"Test inhoud","status":"Concept"}' \
     http://localhost:3001/api/articles
```

## 📊 Database Schema

### Belangrijke Tabellen
- `articles` - Artikelen met status, views, categories 
- `categories` - Article categorieën
- `profiles` - Gebruikersprofielen met rollen
- `user_roles` - Rol toewijzingen (user, manager, admin)
- `user_audit_log` - Audit trail voor gebruikersacties

### RPC Functies
- `get_articles_paginated()` - Gepagineerde artikelen
- `get_users_with_roles()` - Gebruikers met hun rollen
- `create_user_with_role()` - Nieuwe gebruiker met rol
- `activate_user()` / `deactivate_user()` - Gebruiker activatie

## 🛡️ Authenticatie

### Twee Authenticatie Methods
1. **API Key** (server-to-server)
   ```bash
   curl -H "x-api-key: your-api-key" endpoint
   ```

2. **JWT Passthrough** (frontend)
   ```bash
   curl -H "Authorization: Bearer supabase-jwt-token" endpoint
   ```

### Rol Hiërarchie
- `user` - Basis toegang, kan artikelen lezen
- `manager` - Kan artikelen beheren, gebruikers uitnodigen
- `admin` - Volledige toegang, gebruikersbeheer

## 📝 API Endpoints

### Artikelen
```
GET    /api/articles              # Lijst met filters
GET    /api/articles/:id          # Enkel artikel  
POST   /api/articles              # Nieuw artikel (manager+)
PUT    /api/articles/:id          # Update artikel (manager+/author)
DELETE /api/articles/:id          # Verwijder artikel (manager+)
PATCH  /api/articles/:id/publish  # Publiceer artikel (manager+)
POST   /api/articles/:id/view     # Verhoog views (geen auth)
```

### Categorieën
```
GET    /api/categories            # Alle categorieën
POST   /api/categories            # Nieuwe categorie (manager+)
PUT    /api/categories/:id        # Update categorie (manager+)
DELETE /api/categories/:id        # Verwijder categorie (manager+)
```

### Gebruikers (Admin only)
```
GET    /api/users                 # Gebruikerslijst
POST   /api/users                 # Uitnodiging versturen
PATCH  /api/users/:id/activate    # Activeer/deactiveer
```

## 🔧 Development Tools

### Test Data Genereren
```bash
# Voer test script uit
npm run generate-test-data

# Of handmatig via curl
curl -X POST \
     -H "x-api-key: dev-manager-key-2024" \
     -H "Content-Type: application/json" \
     -d @test-data/sample-article.json \
     http://localhost:3001/api/articles
```

### Database Reset (Development)
```bash
# Reset to clean state
npm run db:reset-dev

# Seed with sample data  
npm run db:seed
```

### Monitoring & Debugging
```bash
# Logs bekijken
npm run logs

# Redis debugging
redis-cli monitor

# Health check
curl http://localhost:3001/health/detailed
```

## 🧪 Testing

### Unit Tests
```bash
npm run test
npm run test:coverage
```

### Integration Tests
```bash
npm run test:integration
```

### Manual Testing met REST Client
Open `requests.http` in VS Code met REST Client extension voor ready-to-use requests.

## 🚀 Deployment

### Docker Development
```bash
docker-compose up -d
```

### Production Build
```bash
npm run build
npm run start:prod
```

## 🔍 Troubleshooting

### Veelvoorkomende Problemen
1. **Redis Connection Error**: Start Redis lokaal of update REDIS_URL
2. **Supabase Auth Error**: Controleer JWT_SECRET en PROJECT_URL
3. **Rate Limit Hit**: Verhoog RATE_LIMIT_MAX in development
4. **CORS Error**: Voeg je origin toe aan CORS_ORIGINS

### Debug Endpoints
```bash
# Health check met dependencies
GET /health/detailed

# System metrics
GET /health/metrics

# Current rate limits
GET /health/rate-limits
```

## 📚 API Documentation

- **Swagger UI**: http://localhost:3001/docs
- **OpenAPI Spec**: http://localhost:3001/openapi.json
- **GraphQL Playground**: http://localhost:3001/graphql (when implemented)

## 🔐 Security Notes voor Development

⚠️ **Development Only**: Deze keys zijn alleen voor development!

- API keys zijn hardcoded voor gemak
- Rate limits zijn verhoogd  
- Debug logging is enabled
- CORS is open voor localhost

Voor production: gebruik echte secrets en strikte configuratie.
