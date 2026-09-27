import { requireAuth } from "@/shared/middlewares/require-auth";

export const middleware = requireAuth;

export const config = {
  matcher: [
    "/planificacion/:path*",
    "/reuniones/:path*",
    "/disponibilidad",
    "/proyectos/:path*",
    "/perfil/:path*",
    "/notificaciones/:path*",
  ],
};