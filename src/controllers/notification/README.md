# src/controllers/notification/

Pendiente. Sigue exactamente la misma forma que `src/controllers/meeting/`:
un archivo por operación (create.ts, get-all.ts, get-by-id.ts, patch.ts, delete.ts —
solo las operaciones que este recurso realmente necesite), cada uno envuelto en
`routeHandler` de `shared/http/`, más un `index.ts` que reexporta todo.
