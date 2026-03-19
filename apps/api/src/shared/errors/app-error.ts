export type AppErrorCode =
  | "BAD_REQUEST"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNPROCESSABLE_ENTITY"
  | "INTERNAL_ERROR";

type AppErrorOptions = {
  code: AppErrorCode;
  statusCode: number;
  message: string;
  details?: unknown;
  cause?: unknown;
  isOperational?: boolean;
};

export class AppError extends Error {
  public readonly code: AppErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;
  public readonly cause?: unknown;
  public readonly isOperational: boolean;

  constructor(options: AppErrorOptions) {
    super(options.message);

    this.name = "AppError";
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.details = options.details;
    this.cause = options.cause;
    this.isOperational = options.isOperational ?? true;
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request", details?: unknown) {
    super({
      code: "BAD_REQUEST",
      statusCode: 400,
      message,
      details,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", details?: unknown) {
    super({
      code: "NOT_FOUND",
      statusCode: 404,
      message,
      details,
    });
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict", details?: unknown) {
    super({
      code: "CONFLICT",
      statusCode: 409,
      message,
      details,
    });
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message = "Unprocessable entity", details?: unknown) {
    super({
      code: "UNPROCESSABLE_ENTITY",
      statusCode: 422,
      message,
      details,
    });
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Internal server error", details?: unknown, cause?: unknown) {
    super({
      code: "INTERNAL_ERROR",
      statusCode: 500,
      message,
      details,
      cause,
      isOperational: false,
    });
  }
}