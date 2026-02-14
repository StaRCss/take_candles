import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  SYMBOL: z.string().min(1),
  INTERVAL: z.string().min(1),
  LIMIT: z.coerce.number().int().positive(),
  REQ_DELAY_MS: z.coerce.number().int().positive(),
  START_DATE: z.string().datetime(),
  OUTPUT_FILE: z.string().min(1),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables");
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
