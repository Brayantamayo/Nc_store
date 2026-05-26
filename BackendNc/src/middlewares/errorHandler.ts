// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/environment';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log unexpected errors
  if (statusCode === 500 || !err.isOperational) {
    console.error('💥 Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}
export type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

// Helper to catch async errors in Express routes
export const catchAsync = (fn: AsyncRequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
