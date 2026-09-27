# providers/github/

Adaptador de GitHub. Sigue exactamente la misma forma que `providers/google/`:

- `oauth.ts` → implementa `OAuthProvider` (`getAuthUrl`, `exchangeCode`, `refresh`, `revoke`) contra el flujo OAuth de GitHub. GitHub también soporta PKCE.
- `repos.ts` → funciones puntuales contra la API de GitHub: `listRepos()`, `getRepoActivity()`. Reciben el accessToken y devuelven DTOs (`RepoDTO`), nunca la respuesta cruda.
- `mapper.ts` → traduce la respuesta de la API de GitHub a `RepoDTO` (`types/repo.ts`). Es el único archivo que conoce la forma cruda de GitHub.

Nada fuera de esta carpeta debería importar `fetch` contra `api.github.com` directamente.
