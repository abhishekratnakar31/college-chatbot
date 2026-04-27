import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  PORT: z.string().transform(Number).default(4005),
  DATABASE_URL: z.string().url(),
  QDRANT_URL: z.string().url().optional().default("http://localhost:6333"),
  QDRANT_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().min(1),
  ALLOWED_ORIGIN: z.string().default("*"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  TAVILY_API_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);

export function validateEnv() {
  try {
    envSchema.parse(process.env);
    console.log("✅ Environment variables validated.");
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Environment validation failed:", JSON.stringify(error.format(), null, 2));
    }
    process.exit(1);
  }
}
