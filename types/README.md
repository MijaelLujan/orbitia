# types/

Un archivo por recurso. Regla: si el recurso tiene un schema de Zod en `schemas/`
(porque el dato lo manda el cliente), el tipo de entrada se deriva de ahí con
`z.infer`, nunca se escribe a mano dos veces — ver `meeting.ts` como ejemplo.

Si el recurso viene de un proveedor externo y el cliente nunca lo envía (como
`event.ts`, que viene de Google Calendar), no hay schema de Zod: el DTO se escribe
directo acá y se arma en `providers/<proveedor>/mapper.ts`.

Pendientes: `availability.ts`, `repo.ts`, `profile.ts`, `notification.ts`, `connection.ts`.
