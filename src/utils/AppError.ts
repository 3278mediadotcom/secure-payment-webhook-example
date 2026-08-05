/**
 * Standardized application error.
 *
 * Allows consistent error responses across the API:
 * - statusCode: HTTP status to return
 * - code: machine-readable error code
 * - message: human-readable description
 */
export class AppError extends Error {
  statusCode: number;

  code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);

    this.statusCode = statusCode;

    this.code = code;

    Object.setPrototypeOf(this, AppError.prototype);
  }
}