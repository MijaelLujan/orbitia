# providers/linkedin/

Adaptador de LinkedIn. Misma forma que `providers/google/` y `providers/github/`:

- `oauth.ts` → implementa `OAuthProvider`. LinkedIn no requiere PKCE en su implementación actual, así que `getAuthUrl` no necesita `codeChallenge`.
- `profile.ts` → `getBasicProfile()`, contra el endpoint de perfil básico. Ojo: LinkedIn no da acceso al historial laboral/académico completo con los permisos que se pueden pedir fácilmente (ver el alcance del proyecto) — solo perfil básico.
- `mapper.ts` → traduce la respuesta de LinkedIn a `ProfileDTO` (`types/profile.ts`).
