// Registro de auditoría. Se llama desde puntos concretos: login por proveedor, refresh de
// token, revocación de conexión, intentos de acceso denegados por can().
import { prisma } from "@/shared/prisma";

export async function registerEvent(
  userId: string,
  action: string,
  resource: string,
  metadata?: Record<string, unknown>,
) {
  await prisma.auditLog.create({
    data: { userId, action, resource, metadata: metadata ?? {} },
  });
}
