// Regla de permisos del sistema: ADMIN puede todo, USER solo lo suyo.
// Cada controlador que opera sobre un recurso puntual llama can() antes de delegar al service.
type Action = "read" | "update" | "delete";

type PermissionUser = { id: string; role: "USER" | "ADMIN" };
type OwnedResource = { userId: string };

export function can(user: PermissionUser, _action: Action, resource: OwnedResource): boolean {
  if (user.role === "ADMIN") return true;
  return resource.userId === user.id;
}
