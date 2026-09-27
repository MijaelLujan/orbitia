// Contrato común a los tres adaptadores (google/, github/, linkedin/). Ningún controlador
// ni service de negocio importa un cliente de proveedor directamente: todos pasan por esto.
export type ProviderName = "google" | "github" | "linkedin";

export type ProviderTokens = {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  scope: string;
};

export interface OAuthProvider {
  name: ProviderName;
  getAuthUrl(state: string, codeChallenge?: string): string;
  exchangeCode(code: string, codeVerifier?: string): Promise<ProviderTokens>;
  refresh(refreshToken: string): Promise<ProviderTokens>;
  revoke(accessToken: string): Promise<void>;
}
