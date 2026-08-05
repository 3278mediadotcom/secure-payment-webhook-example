import type { Request, Response, NextFunction } from "express";

import { AppError } from "../utils/AppError";

import { logger } from "../utils/logger";


/**
 * Global error handler middleware.
 *
 * Converts any thrown error into a consistent
 * JSON error response.
 */
export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (error instanceof AppError) {
    logger.warn("AppError handled", {
      code: error.code,

      statusCode: error.statusCode,

      message: error.message,
    });

    res.status(error.statusCode).json({
      success: false,

      error: {
        code: error.code,

        message: error.message,
      },
    });

    return;
  }

  logger.error("Unhandled error", { error });

  res.status(500).json({
    success: false,

    error: {
      code: "INTERNAL_SERVER_ERROR",

      message: "Unexpected server error",
    },
  });
}