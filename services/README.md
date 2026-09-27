# services/ (consumo del cliente)

Ojo: esta carpeta es distinta de `src/services/`. Esta vive del lado del navegador y
solo llama a la propia API vía `shared/api-client.ts` — nunca toca Prisma ni providers/
directamente. La usan los hooks y los componentes de cliente.

Ya está `meeting-service.ts` como ejemplo. Pendientes, mismo patrón:
`event-service.ts`, `availability-service.ts`, `repo-service.ts`,
`profile-service.ts`, `notification-service.ts`.
