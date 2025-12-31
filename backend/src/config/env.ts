import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().regex(/^\d+$/).transform(Number).default("3000"),
  FRONTEND_URL: z.string().default("http://localhost:5173").transform((val): string[] => {
    // Support comma-separated URLs or single URL
    const urls = val.split(",").map(url => url.trim());
    // Validate each URL
    urls.forEach(url => {
      try {
        new URL(url);
      } catch {
        throw new Error(`Invalid URL in FRONTEND_URL: ${url}`);
      }
    });
    return urls;
  }),
  ENCRYPTION_KEY: z.string().min(32).optional(),
  API_SECRET: z.string().min(32).optional(),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("❌ Invalid environment variables:");
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join(".")}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

export default env;

