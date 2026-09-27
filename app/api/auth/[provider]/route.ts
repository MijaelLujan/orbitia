// Arma la URL de autorización y redirige. No valida body ni toca Prisma: solo arranca
// el handshake (ver "Flujo OAuth 2.0" en la arquitectura del proyecto).
import { NextResponse } from "next/server";
import { createOAuthState } from "@/shared/oauth-state";
import { googleOAuth } from "@/providers/google/oauth";
// TODO: importar githubOAuth y linkedinOAuth cuando existan sus providers/*/oauth.ts

const PROVIDERS = {
  google: googleOAuth,
  // github: githubOAuth,
  // linkedin: linkedinOAuth,
} as const;

export async function GET(_req: Request, ctx: { params: { provider: string } }) {
  const provider = PROVIDERS[ctx.params.provider as keyof typeof PROVIDERS];
  if (!provider) {
    return NextResponse.json({ error: "Proveedor no soportado" }, { status: 404 });
  }

  // TODO: generar codeChallenge de PKCE para google/github antes de crear el state
  const state = await createOAuthState();
  return NextResponse.redirect(provider.getAuthUrl(state));
}
