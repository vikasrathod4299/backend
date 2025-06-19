export default class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public validationErrors?: any;

  constructor(
    statusCode: number,
    message: string,
    isOperational = true,
    stack: string = "",
    validationErrors?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.validationErrors = validationErrors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

