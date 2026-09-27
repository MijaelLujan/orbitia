// Único lugar que decide cómo se ve cada error hacia afuera. Nunca se repite un
// try/catch de este tipo en un controlador: todos pasan por route-handler.ts, que
// llama a esto.
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
  console.error(error);
  return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
}

function toResponse(error: AppError) {
  const body: Record<string, unknown> = { error: error.message };
  if (error instanceof ValidationError) body.issues = error.issues;
  return NextResponse.json(body, { status: error.statusCode });
}
