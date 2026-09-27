// Único wrapper de fetch del lado del cliente. Todo archivo en services/ (la capa de
// consumo del navegador) pasa por acá, nunca llama a fetch directamente.
const DEFAULT_HEADERS = { "Content-Type": "application/json" };

export async function apiClient<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: { ...DEFAULT_HEADERS, ...(init?.headers ?? {}) },
  });

  if (!response.ok) {
    let message = "Error inesperado de API";
    try {
      const body = (await response.json()) as { error?: string };
      message = body.error ?? message;
    } catch {
      // el backend no devolvió JSON, nos quedamos con el mensaje genérico
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}
