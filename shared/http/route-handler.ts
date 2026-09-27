import { NextResponse } from "next/server";
import { handleError } from "./error-handler";

type Handler = (req: Request, ctx?: any) => Promise<NextResponse>;

// Envuelve un controlador para que cualquier error lanzado adentro (ZodError, AppError,
// o lo que sea) caiga en error-handler.ts. Ningún controlador escribe su propio try/catch.
export function routeHandler(handler: Handler): Handler {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      return handleError(error);
    }
  };
}
