# app/api/availability/

Pendiente. Sigue exactamente la misma forma que `app/api/meetings/`: `route.ts`
con GET/POST sobre la colección, y `[id]/route.ts` (si aplica) con GET/PATCH/DELETE
sobre un registro puntual. Cada handler solo recibe la petición y delega al
controller correspondiente en `src/controllers/` — no valida ni toca Prisma acá.
