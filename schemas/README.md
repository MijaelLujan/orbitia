# schemas/

Un archivo por recurso, con los schemas de Zod de cada operación (create/patch). Es la
única fuente de verdad de la forma de entrada: los tipos de `types/` se derivan de acá
con `z.infer`, nunca se escriben a mano por separado.

Ya están armados como ejemplo:
- `meeting.schema.ts`
- `connection.schema.ts`

Pendientes, siguiendo el mismo patrón:
- `event.schema.ts`
- `availability.schema.ts`
- `profile.schema.ts`
