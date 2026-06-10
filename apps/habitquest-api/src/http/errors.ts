import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return response.status(400).json({
      error: "Validation failed",
      details: error.flatten()
    });
  }

  if (error instanceof Error) {
    const status = error.message.includes("not found") ? 404 : 400;
    return response.status(status).json({ error: error.message });
  }

  return response.status(500).json({ error: "Internal server error" });
}
