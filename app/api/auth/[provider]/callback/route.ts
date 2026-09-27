// Recibe el code, valida el state (protección CSRF) y lo intercambia por tokens.
import { NextResponse } from "next/server";
import { routeHandler } from "@/shared/http/route-handler";
import { oauthCallbackSchema } from "@/schemas/connection.schema";
import { consumeOAuthState } from "@/shared/oauth-state";
import { encrypt } from "@/shared/crypto";
import { googleOAuth } from "@/providers/google/oauth";
import { prisma } from "@/shared/prisma";

const PROVIDERS = { google: googleOAuth } as const;

export const GET = routeHandler(async (req: Request, ctx: { params: { provider: string } }) => {
  const url = new URL(req.url);
  const { code, state } = oauthCallbackSchema.parse({
    code: url.searchParams.get("code"),
    state: url.searchParams.get("state"),
  });

  const provider = PROVIDERS[ctx.params.provider as keyof typeof PROVIDERS];
  if (!provider) {
    return NextResponse.json({ error: "Proveedor no soportado" }, { status: 404 });
  }

  const codeVerifier = await consumeOAuthState(state);
  if (codeVerifier === null) {
    // el state no existe o ya venció: posible reintento o intento de CSRF, se corta acá
    return NextResponse.json({ error: "Sesión de autorización inválida o vencida" }, { status: 400 });
  }

  const tokens = await provider.exchangeCode(code, codeVerifier || undefined);

  // TODO: reemplazar por el id del usuario autenticado (o crearlo si es su primer login)
  const userId = "TODO: id del usuario autenticado";

  await prisma.connection.upsert({
    where: { userId_provider: { userId, provider: "GOOGLE" } },
    update: {
      accessToken: encrypt(tokens.accessToken),
      refreshToken: tokens.refreshToken ? encrypt(tokens.refreshToken) : undefined,
      expiresAt: tokens.expiresAt,
      scope: tokens.scope,
      status: "ACTIVE",
    },
    create: {
      userId,
      provider: "GOOGLE",
      accessToken: encrypt(tokens.accessToken),
      refreshToken: tokens.refreshToken ? encrypt(tokens.refreshToken) : null,
      expiresAt: tokens.expiresAt,
      scope: tokens.scope,
    },
  });

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/planificacion`);
});
