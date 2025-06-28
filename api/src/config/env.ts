
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  HOST: z.string().default('0.0.0.0'),
  
  // Supabase Configuration
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_JWT_SECRET: z.string().min(1),
  
  // API Authentication
  API_KEYS: z.string().transform(s => s.split(',').filter(Boolean)),
  
  // Rate Limiting & Caching
  REDIS_URL: z.string().optional(),
  
  // CORS Configuration
  CORS_ORIGINS: z.string().transform(s => s.split(',').filter(Boolean)),
  
  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  
  // Security
  JWT_ALGORITHM: z.string().default('HS256'),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW: z.string().default('1 minute')
});

export type EnvConfig = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
