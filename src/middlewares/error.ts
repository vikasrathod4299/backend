import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import ApiError from "../utils/ApiError";
import { ZodError } from "zod";

declare global {
  namespace Express {
    interface Request {
      files?: any;
    }
  }
}

// Error converter middleware

export const errorConverter = (
  err: Error  | ApiError | ZodError,
  _req: Request,
  _res: Response,
  next: NextFunction,
) => {
  let error: ApiError;
 
  if (!(err instanceof ApiError)) {
    if (err instanceof ZodError) {
      // Handle Zod validation error
      error = new ApiError(
        422,
        "Payload validation failed!",
        true,
        err.stack,
        err.errors,
      );
    } else if (err instanceof ApiError) {
      // Handle mongoose error
      const statusCode = httpStatus.BAD_REQUEST;
      const message = err.message || httpStatus[statusCode];
      error = new ApiError(statusCode, message, false, err.stack);
    } else {
      // Handle general errors
      const statusCode = httpStatus.INTERNAL_SERVER_ERROR;
      const message = err.message || httpStatus[statusCode];
      error = new ApiError(statusCode, message, false, err.stack);
    }
  } else {
    error = err;
  }
  next(error);
};

// Error handler middleware
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let { statusCode, message, validationErrors } = err;
  const NODE_ENV = process.env.NODE_ENV;

  if (NODE_ENV === "production" && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR] as string;
  }

  res.locals.errorMessage = err.message;

  const response = {
    statusCode,
    message,
    ...(validationErrors && { errors: validationErrors }),
    stack: err.stack
  };

  if (NODE_ENV === "development") {
    console.error(err);
  }

  res.status(statusCode).json(response);
};



