// Implementa OAuthProvider para Google. Google soporta PKCE, así que getAuthUrl recibe
// el code_challenge y lo suma a la URL de autorización.
import type { OAuthProvider, ProviderTokens } from "@/providers/provider.interface";

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPES = ["openid", "email", "profile", "https://www.googleapis.com/auth/calendar.events"];

export const googleOAuth: OAuthProvider = {
  name: "google",

  getAuthUrl(state, codeChallenge) {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
      response_type: "code",
      scope: SCOPES.join(" "),
      state,
      access_type: "offline",
      prompt: "consent",
      ...(codeChallenge ? { code_challenge: codeChallenge, code_challenge_method: "S256" } : {}),
    });
    return `${AUTH_URL}?${params.toString()}`;
  },

  async exchangeCode(code, codeVerifier): Promise<ProviderTokens> {
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
        grant_type: "authorization_code",
        code,
        ...(codeVerifier ? { code_verifier: codeVerifier } : {}),
      }),
    });
    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      scope: data.scope,
    };
  },

  async refresh(refreshToken): Promise<ProviderTokens> {
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });
    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      scope: data.scope,
    };
  },

  async revoke(accessToken) {
    await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, { method: "POST" });
  },
};
