import { z } from "zod";

// Valida el callback OAuth (app/api/auth/[provider]/callback/route.ts)
export const oauthCallbackSchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
});
