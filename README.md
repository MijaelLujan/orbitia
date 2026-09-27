# Plataforma OAuth — Google, GitHub y LinkedIn

Centraliza agenda, reuniones (con link de Meet automático), disponibilidad
compartible, repositorios de GitHub y perfil profesional, conectando cada
servicio vía OAuth 2.0. El sistema nunca pide ni guarda contraseñas de esas
cuentas externas.

## Cómo está armado, en una frase

```
Componente React
     ↓
services/ (fetch al API propio)
     ↓
app/api/[recurso]/route.ts
     ↓
src/controllers/[recurso]/
     ↓
src/services/[recurso]/  ──────→  providers/<proveedor>/  ──────→  API externa
     ↓
PostgreSQL (Prisma) / Redis (solo para lo de corta duración: state OAuth, rate limit, cache)
```

`shared/` tiene todo lo transversal: conexión a Postgres y Redis, cifrado de
tokens, permisos, auditoría, y la jerarquía de errores + el wrapper que evita
repetir `try/catch` en cada controller (`shared/errors/`, `shared/http/`).

## Levantar el proyecto (Windows)

Con PowerShell o la terminal de VS Code, parados en la carpeta del proyecto:

```powershell
npm install

copy .env.example .env
# completar .env con las credenciales reales (DB, Redis, client id/secret de cada proveedor)

# 1. Levantar la base de datos y Redis en Docker (se queda corriendo en segundo plano)
docker compose up -d postgres redis

# 2. Correr el server de Next.js en tu máquina, normal
npm run dev

npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed

npm run dev
```

La app queda en `http://localhost:3000`.
