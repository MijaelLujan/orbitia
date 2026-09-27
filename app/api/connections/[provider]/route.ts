// Estado y revocación de una conexión puntual. DELETE revoca en el proveedor y marca
// la conexión como REVOKED localmente aunque la llamada al proveedor falle, para que
// el usuario nunca quede bloqueado si ese servicio externo no responde.
import { NextResponse } from "next/server";
import { routeHandler } from "@/shared/http/route-handler";
import { prisma } from "@/shared/prisma";
import { decrypt } from "@/shared/crypto";
import { googleOAuth } from "@/providers/google/oauth";
import { registerEvent } from "@/shared/audit-log";

export const DELETE = routeHandler(async (_req: Request, ctx: { params: { provider: string } }) => {
  const userId = "TODO: id del usuario autenticado";
  const provider = ctx.params.provider.toUpperCase() as "GOOGLE" | "GITHUB" | "LINKEDIN";

  const connection = await prisma.connection.findUnique({
    where: { userId_provider: { userId, provider } },
  });

  if (connection) {
    try {
      if (provider === "GOOGLE") await googleOAuth.revoke(decrypt(connection.accessToken));
      // TODO: sumar el revoke de github/linkedin cuando existan sus providers/*/oauth.ts
    } catch {
      // si el proveedor no responde, igual revocamos localmente
    }
  }

  await prisma.connection.updateMany({
    where: { userId, provider },
    data: { status: "REVOKED" },
  });

  await registerEvent(userId, "connection.revoked", "connection", { provider });

  return NextResponse.json({ data: { provider, status: "REVOKED" } });
});
