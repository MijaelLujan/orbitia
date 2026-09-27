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
