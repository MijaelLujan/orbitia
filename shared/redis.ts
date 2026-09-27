// Singleton de conexión a Redis. Se usa para todo lo de corta duración:
// state/code_verifier del handshake OAuth, límite de intentos de login, cache de APIs externas.
import { Redis } from "ioredis";

declare global {
  var redis: Redis | undefined;
}

export const redis = global.redis ?? new Redis(process.env.REDIS_URL!);

if (process.env.NODE_ENV !== "production") {
  global.redis = redis;
}
