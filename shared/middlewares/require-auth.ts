import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = [
  "/planificacion",
  "/reuniones",
  "/disponibilidad",
  "/proyectos",
  "/perfil",
  "/notificaciones",
];

const SESSION_COOKIE = "app_session";

export function requireAuth(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requiresAuth = PROTECTED_ROUTES.includes(pathname);

  if (!requiresAuth) return NextResponse.next();

  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  if (hasSession) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}