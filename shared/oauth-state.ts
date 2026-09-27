// Genera y valida el `state` (y el code_verifier de PKCE) del handshake OAuth.
// Se guardan en Redis con TTL corto: no tiene sentido persistirlos en Postgres,
// viven un puñado de minutos y se usan una sola vez.
import { randomBytes } from "crypto";
import { redis } from "@/shared/redis";

const TTL_SECONDS = 300; // 5 minutos

export async function createOAuthState(codeVerifier?: string): Promise<string> {
  const state = randomBytes(32).toString("hex");
  await redis.set(`oauth:state:${state}`, codeVerifier ?? "", "EX", TTL_SECONDS);
  return state;
}

export async function consumeOAuthState(state: string): Promise<string | null> {
  const key = `oauth:state:${state}`;
  const codeVerifier = await redis.get(key);
  if (codeVerifier === null) return null; // no existe o ya venció → cortar el flujo
  await redis.del(key); // de un solo uso
  return codeVerifier;
}
