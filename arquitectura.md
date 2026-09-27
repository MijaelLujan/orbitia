# Arquitectura — Plataforma de Integración OAuth (Google, GitHub, LinkedIn)

Esta guía documenta la arquitectura del sistema de planificación de horarios, reuniones y proyectos que se integra con Google, GitHub y LinkedIn mediante OAuth 2.0. Sigue la misma convención que las guías anteriores: nombres de carpetas y archivos en inglés, texto explicativo y comentarios en español.

---

## Stack tecnológico

| Herramienta | Rol |
| --- | --- |
| Next.js 16+ (App Router) | Framework fullstack: páginas, rutas de API y las rutas que arman el flujo de redirección OAuth |
| TypeScript | Tipado estricto en todo el proyecto. Cero `any` |
| Prisma 7 | ORM para PostgreSQL — usuarios, conexiones OAuth, tokens, eventos, permisos, notificaciones |
| PostgreSQL | Base de datos relacional |
| Zod | Validación de datos de entrada, tanto de la API interna como de las respuestas de los tres proveedores externos |
| Zustand | Estado global en el cliente |
| Tailwind CSS | Estilos |
| Redis | Almacenamiento de corta duración: `state`/`code_verifier` del handshake OAuth (con TTL, nunca en Postgres), límite de intentos de login, cache de las respuestas de GitHub/LinkedIn para no agotar sus límites de rate |

**Nota sobre Auth.js/NextAuth:** deliberadamente no se usa. El flujo de autorización se implementa a mano (construcción de la URL de autorización, `state` y PKCE, intercambio del `code`, refresh) porque es justamente el contenido central de la materia (Seguridad, Protocolos de comunicación) y porque el sistema necesita controlar de punta a punta el ciclo de vida del token: guardarlo cifrado, refrescarlo antes de que expire y revocarlo bajo demanda. Una librería de alto nivel esconde exactamente esa parte.

---

## Visión general

El proyecto separa tres mundos en vez de dos: **cliente**, **servidor**, y una capa intermedia de **broker** hacia los proveedores externos.

En el cliente viven los componentes de React, el estado con Zustand y los servicios que consumen la API propia por `fetch`.

En el servidor viven las rutas, los controladores y los servicios que hablan con Prisma, igual que en un CRUD normal.

La diferencia respecto a un proyecto sin integraciones externas es la capa `providers/`: ningún controlador ni servicio de negocio llama directamente a la API de Google, GitHub o LinkedIn. Todo pasa por un adaptador que sabe autenticar la llamada con el token guardado del usuario, hablar el protocolo específico de cada proveedor, y traducir la respuesta a un formato interno común antes de devolverla. Esto aísla al resto del sistema de los cambios, caídas o particularidades de cada servicio externo.

```
Componente React
     ↓
services/ (fetch al API propio)
     ↓
app/api/[recurso]/route.ts
     ↓
src/controllers/[recurso]/
     ↓
src/services/[recurso]/  ──────→  providers/<proveedor>/  ──────→  API externa (Google / GitHub / LinkedIn)
     ↓
PostgreSQL (Prisma)
```

---

## Estructura de carpetas

```
app/
├── (public)/
│   ├── login/page.tsx
│   └── disponibilidad/[token]/page.tsx      → vista pública de un horario compartido, sin sesión
├── (dashboard)/
│   ├── layout.tsx
│   ├── planificacion/page.tsx
│   ├── reuniones/page.tsx
│   ├── disponibilidad/page.tsx
│   ├── proyectos/page.tsx
│   ├── perfil/page.tsx
│   └── notificaciones/page.tsx
├── api/
│   ├── auth/
│   │   ├── [provider]/route.ts              → arma la URL de autorización y redirige
│   │   └── [provider]/callback/route.ts     → recibe el code, lo intercambia por tokens
│   ├── events/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── meetings/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── availability/
│   │   ├── route.ts
│   │   └── [token]/route.ts                 → endpoint público, consumido por la página pública
│   ├── repos/
│   │   └── route.ts
│   ├── profile/
│   │   └── route.ts
│   ├── notifications/
│   │   └── route.ts
│   └── connections/
│       └── [provider]/route.ts               → estado y revocación de una conexión
├── layout.tsx
└── page.tsx

src/
├── controllers/[recurso]/
│   ├── create.ts / get-all.ts / get-by-id.ts / patch.ts / delete.ts / index.ts
└── services/[recurso]/
    ├── create.ts / get-all.ts / get-by-id.ts / patch.ts / delete.ts / service.ts / index.ts
    (recursos: event, meeting, availability, repo, profile, notification, connection)

providers/                            ← capa nueva: un adaptador por servicio externo
├── provider.interface.ts             → contrato común a los tres adaptadores
├── google/
│   ├── oauth.ts                       → getAuthUrl(), exchangeCode(), refresh(), revoke()
│   ├── calendar.ts                    → createEvent(), listEvents(), deleteEvent()
│   ├── meet.ts                        → createMeetingLink()
│   └── mapper.ts                      → respuesta de Google → formato interno
├── github/
│   ├── oauth.ts
│   ├── repos.ts                       → listRepos(), getRepoActivity()
│   └── mapper.ts
└── linkedin/
    ├── oauth.ts
    ├── profile.ts                     → getBasicProfile()
    └── mapper.ts

shared/                                ← todo lo transversal, tanto de servidor como de cliente
├── prisma.ts                         → singleton de conexión a PostgreSQL
├── redis.ts                          → singleton de conexión a Redis
├── api-client.ts                     → wrapper de fetch para el cliente
├── crypto.ts                         → encrypt()/decrypt() de tokens en reposo
├── oauth-state.ts                    → genera y valida state + code_verifier/code_challenge (PKCE), guardados en Redis con TTL
├── permissions.ts                    → can(user, action, resource)
├── audit-log.ts                      → registerEvent()
├── utils.ts
├── errors/
│   ├── app-error.ts
│   ├── validation-error.ts
│   ├── not-found-error.ts
│   ├── conflict-error.ts
│   └── index.ts
└── http/
    ├── route-handler.ts               → envuelve un controlador para no repetir try/catch en cada uno
    └── error-handler.ts               → convierte cualquier error propio o ZodError en la respuesta { error, issues? } con el status code correcto

schemas/
├── event.schema.ts
├── meeting.schema.ts
├── availability.schema.ts
├── connection.schema.ts              → valida el callback (state, code)
└── profile.schema.ts

types/
├── event.ts, meeting.ts, availability.ts, repo.ts, profile.ts, notification.ts, connection.ts

services/                             (consumo cliente, distinto de src/services/)
├── event-service.ts, meeting-service.ts, availability-service.ts,
└── repo-service.ts, profile-service.ts, notification-service.ts

store/
├── event.store.ts, meeting.store.ts, availability.store.ts,
└── notification.store.ts, connection.store.ts

hooks/
├── use-events.ts, use-meetings.ts, use-availability.ts,
└── use-notifications.ts, use-connections.ts

components/
├── auth/               → botones "Conectar con Google/GitHub/LinkedIn", estado de conexión
├── calendar/
├── meetings/
├── availability/        → calendario de selección + página pública
├── repos/
├── profile/
├── notifications/
├── shared/               → navbar, sidebar, badge de rol
└── ui/

collection/                           → colecciones de requests (Postman/Thunder Client)
prisma/
├── schema.prisma
├── migrations/
└── seed.ts
```

---

## Las 3 capas del servidor

Igual que en un CRUD normal, toda petición sigue este flujo:

```
Petición HTTP
     ↓
app/api/[recurso]/route.ts        → Solo recibe y delega
     ↓
src/controllers/[recurso]/        → Valida, extrae datos, devuelve respuesta HTTP
     ↓
src/services/[recurso]/           → Habla con Prisma y, si aplica, con providers/
     ↓
Base de datos (PostgreSQL) / API externa
```

Ningún controlador escribe su propio `try/catch`: se envuelve con `routeHandler`, de `shared/http/`, y cualquier error cae en un mismo lugar.

```typescript
// src/controllers/meeting/create.ts
import { NextResponse } from "next/server";
import { routeHandler } from "@/shared/http/route-handler";
import { createMeetingSchema } from "@/schemas/meeting.schema";
import { createMeetingService } from "@/src/services/meeting";

export const postMeetingController = routeHandler(async (req: Request) => {
  const body = await req.json();
  const payload = createMeetingSchema.parse(body);
  const meeting = await createMeetingService(payload);
  return NextResponse.json({ data: meeting }, { status: 201 });
});
```

```typescript
// shared/http/route-handler.ts
import { NextResponse } from "next/server";
import { handleError } from "./error-handler";

type Handler = (req: Request) => Promise<NextResponse>;

export function routeHandler(handler: Handler): Handler {
  return async (req) => {
    try {
      return await handler(req);
    } catch (error) {
      return handleError(error);
    }
  };
}
```

Si `createMeetingSchema.parse` falla, lanza un `ZodError`. Si un service lanza un error propio (`NotFoundError`, `ConflictError`), también sube sin que el controlador lo toque. `error-handler.ts` es el único lugar que decide cómo se ve cada error hacia afuera:

```typescript
// shared/http/error-handler.ts
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError, ValidationError } from "@/shared/errors";

export function handleError(error: unknown) {
  if (error instanceof ZodError) {
    return toResponse(ValidationError.fromZodError(error));
  }
  if (error instanceof AppError) {
    return toResponse(error);
  }
  return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
}

function toResponse(error: AppError) {
  const body: Record<string, unknown> = { error: error.message };
  if (error instanceof ValidationError) body.issues = error.issues;
  return NextResponse.json(body, { status: error.statusCode });
}
```

```typescript
// shared/errors/app-error.ts
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code = "APP_ERROR",
    public readonly statusCode = 500,
  ) {
    super(message);
    this.name = "AppError";
  }
}
```

```typescript
// shared/errors/validation-error.ts
import { ZodError } from "zod";
import { AppError } from "./app-error";

export type ValidationIssue = { field: string; message: string; code: string };

export class ValidationError extends AppError {
  public readonly issues: ValidationIssue[];

  constructor(issues: ValidationIssue[]) {
    super(issues.map((i) => `${i.field}: ${i.message}`).join(", "), "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
    this.issues = issues;
  }

  static fromZodError(error: ZodError): ValidationError {
    const issues = error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
      code: issue.code ?? "invalid",
    }));
    return new ValidationError(issues);
  }
}
```

`not-found-error.ts` y `conflict-error.ts` siguen el mismo patrón que `validation-error.ts`, cambiando solo el `statusCode` (404 y 409) y qué reciben en el constructor.

**Códigos de respuesta:** 200 (éxito sobre GET/PATCH/PUT/DELETE), 201 (POST), 400 (payload inválido), 401 (sin sesión), 403 (sin permiso sobre el recurso), 404 (no encontrado), 409 (conflicto), 500 (error interno).

**Formato de respuesta:** éxito `{ data: ... }`, error `{ error: "mensaje" }`, error de validación `{ error: "mensaje", issues: [...] }`.

---

## Capa `providers/` — patrón adaptador

Ningún controlador ni service de negocio importa un cliente de Google/GitHub/LinkedIn directamente. Todos hablan contra la misma interfaz:

```typescript
// providers/provider.interface.ts
export type ProviderName = "google" | "github" | "linkedin";

export type ProviderTokens = {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  scope: string;
};

export interface OAuthProvider {
  name: ProviderName;
  getAuthUrl(state: string, codeChallenge?: string): string;
  exchangeCode(code: string, codeVerifier?: string): Promise<ProviderTokens>;
  refresh(refreshToken: string): Promise<ProviderTokens>;
  revoke(accessToken: string): Promise<void>;
}
```

Cada proveedor implementa esta interfaz y además expone sus propias funciones de dominio (`calendar.ts`, `repos.ts`, `profile.ts`). El `mapper.ts` de cada carpeta es el único lugar donde se traduce la forma específica de ese proveedor al DTO interno:

```typescript
// providers/google/mapper.ts
import type { EventDTO } from "@/types/event";

type GoogleCalendarEvent = {
  id: string;
  summary: string;
  start: { dateTime: string };
  end: { dateTime: string };
  hangoutLink?: string;
};

export function toEventDTO(event: GoogleCalendarEvent): EventDTO {
  return {
    id: event.id,
    title: event.summary,
    startsAt: event.start.dateTime,
    endsAt: event.end.dateTime,
    meetingUrl: event.hangoutLink ?? null,
    source: "google",
  };
}
```

Así, `src/services/event/get-all.ts` llama a `providers/google/calendar.ts` y recibe siempre un `EventDTO[]` ya normalizado, sin conocer la forma que usa Google internamente. Si mañana se agrega Zoom o se cambia la versión de la API de Google, el cambio queda contenido en esa carpeta.

---

## Flujo OAuth 2.0

```
1. Usuario hace clic en "Conectar con Google"
        ↓
2. GET /api/auth/google
   → genera `state` aleatorio y, para Google/GitHub, un par PKCE (code_verifier / code_challenge)
   → guarda state + code_verifier en Redis con un TTL corto (2-5 min), la clave es el propio state
   → redirige a la URL de autorización del proveedor (providers/google/oauth.ts → getAuthUrl())
        ↓
3. El usuario acepta los permisos en la pantalla de Google
        ↓
4. Google redirige a GET /api/auth/google/callback?code=...&state=...
        ↓
5. El callback valida que `state` coincide con el guardado (si no, corta — protección CSRF)
   → llama a exchangeCode(code, codeVerifier) para cambiar el code por access_token/refresh_token
   → cifra los tokens (lib/crypto.ts) y los guarda en `Connection`, asociados al usuario logueado
   → marca la conexión como ACTIVE
        ↓
6. Redirige al dashboard con la conexión ya disponible
```

El `state` es obligatorio en los tres proveedores como defensa contra CSRF. PKCE se agrega en Google y GitHub porque ambos lo soportan sobre el flujo de código de autorización; LinkedIn no lo requiere en su implementación actual, así que ese adaptador solo usa `state`.

Por qué Redis y no una tabla de Postgres o una cookie firmada: `state` y `code_verifier` solo existen entre el paso 2 y el paso 5, un puñado de minutos como máximo. Guardarlos en Postgres significa una tabla que hay que limpiar aparte (`oauth_state` acumulando filas vencidas); una cookie firmada funciona, pero si el usuario arranca el login en un dispositivo y termina en otro (o el navegador la bloquea) el flujo se rompe. Redis con TTL nativo expira solo la clave sin ningún proceso de limpieza, y no depende de que el navegador conserve nada entre el paso 2 y el 4.

```typescript
// shared/redis.ts
import { Redis } from "ioredis";

declare global {
  var redis: Redis | undefined;
}

export const redis = global.redis ?? new Redis(process.env.REDIS_URL!);

if (process.env.NODE_ENV !== "production") {
  global.redis = redis;
}
```

```typescript
// shared/oauth-state.ts
import { randomBytes } from "crypto";
import { redis } from "@/shared/redis";

const TTL_SECONDS = 300; // 5 minutos

export async function createOAuthState(codeVerifier?: string) {
  const state = randomBytes(32).toString("hex");
  await redis.set(`oauth:state:${state}`, codeVerifier ?? "", "EX", TTL_SECONDS);
  return state;
}

export async function consumeOAuthState(state: string) {
  const key = `oauth:state:${state}`;
  const codeVerifier = await redis.get(key);
  if (codeVerifier === null) return null; // no existe o ya venció
  await redis.del(key); // de un solo uso
  return codeVerifier;
}
```

Nota de despliegue: para no salirse de la justificación económica del proyecto (todo con nivel gratuito), un Redis administrado como Upstash tiene un free tier que alcanza sin problema para un prototipo académico, y su cliente HTTP funciona bien en entornos serverless donde una conexión TCP persistente a Redis puede ser un problema.

---

## Tokens: modelo, cifrado, refresh y revocación

```prisma
enum Provider {
  GOOGLE
  GITHUB
  LINKEDIN
}

enum ConnectionStatus {
  ACTIVE
  EXPIRED
  REVOKED
}

model Connection {
  id           String            @id @default(uuid())
  userId       String
  provider     Provider
  accessToken  String            // cifrado con AES-256-GCM, nunca en texto plano
  refreshToken String?           // cifrado
  expiresAt    DateTime
  scope        String
  status       ConnectionStatus  @default(ACTIVE)
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, provider])
}
```

- **Cifrado en reposo:** `lib/crypto.ts` cifra con AES-256-GCM usando una clave desde `ENCRYPTION_KEY` (variable de entorno, nunca en el repo). Ningún token se guarda ni se loguea en texto plano.
- **Refresh:** estrategia *lazy*. Antes de cada llamada a un proveedor, el service revisa `expiresAt`; si vence en menos de 5 minutos, llama `refresh()` y actualiza el registro. Se eligió esto en vez de un cron aparte porque es más simple para un prototipo académico y no exige un scheduler adicional.
- **Revocación:** `DELETE /api/connections/[provider]` llama `provider.revoke(accessToken)` y marca la conexión como `REVOKED` localmente aunque la llamada de revocación falle en el proveedor, para que el usuario nunca quede bloqueado si ese servicio externo no responde.

---

## Tipos y DTOs

Misma regla que en un CRUD normal: la base de datos usa `snake_case`, los DTOs que salen hacia el cliente usan `camelCase`. La diferencia es dónde ocurre la conversión según el origen del dato:

- Recursos propios (`event`, `meeting`, `availability`, `notification`): la conversión vive en `src/services/[recurso]/service.ts`, como siempre.
- Recursos que vienen de un proveedor externo (`repo`, `profile` de LinkedIn): la conversión vive en `providers/<proveedor>/mapper.ts`, porque el dato nunca pasa por la base de datos, solo se cachea temporalmente si hace falta.

**El schema de Zod es la única fuente de verdad para el tipo de entrada.** Nunca se escribe a mano un `type` que ya existe como schema — se deriva con `z.infer`. El DTO de salida sí se escribe a mano, porque incluye campos que el servidor calcula y Zod nunca valida (`id`, `meetingUrl`), pero reutiliza el tipo de entrada en vez de repetir sus campos:

```typescript
// types/meeting.ts
import type { z } from "zod";
import type { createMeetingSchema } from "@/schemas/meeting.schema";

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;

export type MeetingDTO = CreateMeetingInput & {
  id: string;
  meetingUrl: string;
};
```

`import type` en vez de `import` normal: `createMeetingSchema` acá solo se usa como tipo (`typeof createMeetingSchema`), nunca como valor, así que `import type` asegura que el runtime de Zod no se arrastre a ningún archivo que solo necesite el tipo — sin depender de que el bundler lo detecte solo.

**Dónde para esta fusión con `&`:** es válida mientras cada campo que `MeetingDTO` hereda de `CreateMeetingInput` tenga exactamente el mismo tipo de entrada y de salida. El día que uno diverja (por ejemplo, que `participants` deje de ser `string[]` en la salida porque el mapper ya lo resolvió contra el evento de Google y ahora es `{ email: string; status: "confirmed" | "pending" }[]`), esa fusión se rompe en un error de intersección confuso en vez de avisar con claridad. En ese momento, ese campo se saca del `&` y se redefine a mano en el DTO:

```typescript
export type MeetingDTO = Omit<CreateMeetingInput, "participants"> & {
  id: string;
  meetingUrl: string;
  participants: { email: string; status: "confirmed" | "pending" }[];
};
```

Mismo patrón para `event`, `availability` y `profile`: un solo schema de Zod por recurso, del que se deriva el input, y un DTO que lo extiende con lo que agrega el servidor.

---

## Validación con Zod

```typescript
// schemas/connection.schema.ts
import { z } from "zod";

export const oauthCallbackSchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
});

export type OAuthCallbackInput = z.infer<typeof oauthCallbackSchema>;
```

```typescript
// schemas/meeting.schema.ts
import { z } from "zod";

export const createMeetingSchema = z.object({
  title: z.string().trim().min(2).max(120),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  participants: z.array(z.string().email()).min(1),
});

export type CreateMeetingSchema = z.infer<typeof createMeetingSchema>;
```

---

## Enlaces públicos de disponibilidad

```prisma
model AvailabilityLink {
  id        String   @id @default(uuid())
  token     String   @unique          // aleatorio, generado con crypto.randomBytes
  userId    String
  weekStart DateTime
  expiresAt DateTime
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
}
```

Flujo: el usuario elige una semana en `/disponibilidad` y genera un enlace. `POST /api/availability` crea un `AvailabilityLink` con un `token` aleatorio de 32 bytes y un `expiresAt`. El enlace resultante (`/disponibilidad/[token]`) es una ruta dentro del grupo `(public)`, sin sesión: la página del servidor lee el token, valida que no esté vencido, y muestra la disponibilidad en modo solo lectura. Nadie puede escribir a través de esa ruta; el `GET /api/availability/[token]` es el único endpoint que la sirve, y es de solo lectura por diseño.

---

## Permisos

El sistema define roles simples sobre `User`: `USER` (por defecto) y `ADMIN` (monitoreo/soporte). `shared/permissions.ts` centraliza la regla:

```typescript
// shared/permissions.ts
type Action = "read" | "update" | "delete";

export function can(user: { id: string; role: "USER" | "ADMIN" }, action: Action, resource: { userId: string }) {
  if (user.role === "ADMIN") return true;
  return resource.userId === user.id;
}
```

Cada controlador que opera sobre un recurso puntual llama `can()` antes de delegar al service, y devuelve 403 si no pasa. Esto cubre el requerimiento de "distintos niveles de permiso" sin necesitar una tabla de roles granular, que sería sobreingeniería para el alcance del prototipo.

---

## Notificaciones

```prisma
enum NotificationType {
  MEETING_CREATED
  MEETING_UPDATED
  MEETING_CANCELLED
}

model Notification {
  id        String            @id @default(uuid())
  userId    String
  type      NotificationType
  payload   Json
  read      Boolean           @default(false)
  createdAt DateTime          @default(now())

  user User @relation(fields: [userId], references: [id])
}
```

Las notificaciones se disparan desde el propio service del recurso, no desde un listener aparte: `src/services/meeting/patch.ts`, por ejemplo, crea la `Notification` correspondiente dentro de la misma transacción que actualiza la reunión. Para este alcance la entrega es solo in-app (lista en `/notificaciones` + contador en el navbar); el modelo queda preparado para agregar email o push más adelante sin cambiar el esquema.

---

## Auditoría / monitoreo

```typescript
// shared/audit-log.ts
import { prisma } from "@/shared/prisma";

export async function registerEvent(userId: string, action: string, resource: string, metadata?: Record<string, unknown>) {
  await prisma.auditLog.create({
    data: { userId, action, resource, metadata: metadata ?? {} },
  });
}
```

Se registra en puntos concretos: login vía cada proveedor, refresh de token, revocación de conexión, e intentos de acceso denegados por `can()`. Cubre el contenido de "Monitoreo" de la materia sin necesitar una herramienta externa: alcanza con una tabla `AuditLog` y un `registerEvent()` llamado desde los puntos que importan.

---

## Capa de consumo de API (cliente)

Mismo patrón que un CRUD normal: un wrapper único de `fetch` en `shared/api-client.ts`, y un archivo de servicio por recurso en `services/`:

```typescript
// services/meeting-service.ts
import { apiClient } from "@/shared/api-client";
import type { CreateMeetingInput, MeetingDTO } from "@/types/meeting";

export async function fetchMeetings(): Promise<MeetingDTO[]> {
  const { data } = await apiClient<{ data: MeetingDTO[] }>("/api/meetings", { cache: "no-store" });
  return data;
}

export async function createMeeting(input: CreateMeetingInput): Promise<MeetingDTO> {
  const { data } = await apiClient<{ data: MeetingDTO }>("/api/meetings", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data;
}
```

`store/connection.store.ts` guarda qué proveedores están conectados, para que los componentes (por ejemplo, el botón de agendar reunión) sepan si mostrarse habilitados o pedir primero conectar Google.

---

## Configuración de Prisma 7

```typescript
// prisma.config.ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts",
  },
  datasource: {
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
```

```dotenv
DATABASE_URL="postgresql://usuario:password@host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://usuario:password@host:5432/postgres"

ENCRYPTION_KEY=""            # 32 bytes, para AES-256-GCM sobre los tokens
REDIS_URL="redis://usuario:password@host:6379"

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
LINKEDIN_CLIENT_ID=""
LINKEDIN_CLIENT_SECRET=""
```

```bash
npx prisma generate       # Genera el cliente tras cualquier cambio al schema
npx prisma migrate dev    # Crea y aplica una migración en desarrollo
npx prisma db seed        # Ejecuta el seed
npx prisma studio         # Panel visual para ver y editar datos
```

---

## Flujo de Git

```bash
git checkout main
git pull origin main
git checkout -b feat/nombre-tarea

git add .
git commit -m "feat: agrega flujo oauth de github"

git push -u origin feat/nombre-tarea
# Pull Request hacia dev o main según corresponda
```

**Commits:** `feat:`, `fix:`, `refactor:`, `chore:`. **Ramas:** `feat/nombre-tarea`, `fix/nombre-bug`, `refactor/nombre-modulo`.
