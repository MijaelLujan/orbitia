# src/services/profile/

Pendiente. Sigue la misma forma que `src/services/meeting/`: un archivo por
operación, un `service.ts` con el tipo tal como sale de Prisma y la función
`toProfileDTO()` que lo convierte a DTO (snake_case → camelCase), y un
`index.ts` que reexporta todo. Si el recurso viene de un proveedor externo
(`repo`, `profile`), habla con `providers/<proveedor>/` en vez de con Prisma
directamente.
