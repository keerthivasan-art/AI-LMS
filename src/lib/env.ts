import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().min(1).optional(),
  CLERK_SECRET_KEY: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),
});

const _serverEnv = serverSchema.safeParse(process.env);
const _clientEnv = clientSchema.safeParse({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
});

if (!_serverEnv.success) {
  console.warn("⚠️ Invalid server environment variables:", _serverEnv.error.format());
}

if (!_clientEnv.success) {
  console.warn("⚠️ Invalid client environment variables:", _clientEnv.error.format());
}

export const env = {
  // Server-only environment variables
  DATABASE_URL: _serverEnv.success ? _serverEnv.data.DATABASE_URL : process.env.DATABASE_URL,
  CLERK_SECRET_KEY: _serverEnv.success ? _serverEnv.data.CLERK_SECRET_KEY : process.env.CLERK_SECRET_KEY,
  OPENAI_API_KEY: _serverEnv.success ? _serverEnv.data.OPENAI_API_KEY : process.env.OPENAI_API_KEY,
  NODE_ENV: _serverEnv.success ? _serverEnv.data.NODE_ENV : "development",

  // Public/Client environment variables
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: _clientEnv.success
    ? _clientEnv.data.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    : process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,

  // Feature readiness helpers
  isClerkConfigured: Boolean(
    (_clientEnv.success ? _clientEnv.data.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY : process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    (_serverEnv.success ? _serverEnv.data.CLERK_SECRET_KEY : process.env.CLERK_SECRET_KEY)
  ),
  isDatabaseConfigured: Boolean(
    _serverEnv.success ? _serverEnv.data.DATABASE_URL : process.env.DATABASE_URL
  ),
  isOpenAIConfigured: Boolean(
    _serverEnv.success ? _serverEnv.data.OPENAI_API_KEY : process.env.OPENAI_API_KEY
  ),
};
