import { AppError } from "./app-error";

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} no encontrado`, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}
