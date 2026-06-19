import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),

  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 chars'),
  JWT_ADMIN_EXPIRES_IN: z.string().default('16h'),
  TABLE_TOKEN_EXPIRES_IN: z.string().default('90d'),

  IMAGE_UPLOAD_DIR: z.string().min(1),
  STATIC_BASE_URL: z.string().url(),

  CORS_ORIGINS: z.string().default(''),
  TZ: z.string().default('Asia/Seoul'),
});

export type AppEnv = z.infer<typeof envSchema>;

export function envValidation(raw: Record<string, unknown>): AppEnv {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  return result.data;
}
