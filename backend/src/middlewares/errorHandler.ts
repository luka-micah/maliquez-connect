import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

interface AppError extends Error {
  statusCode?: number;
  errors?: Array<{ field: string; message: string }>;
}

const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      const target = (err.meta?.target as string[]) || [];
      message = `Duplicate value for ${target.join(', ')}`;
    }
    if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Resource not found';
    }
    if (err.code === 'P2003') {
      statusCode = 400;
      message = 'Referenced resource does not exist';
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data provided';
  }

  if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON';
  }

  const response: Record<string, unknown> = {
    success: false,
    message,
  };

  if (errors.length > 0) response.errors = errors;
  if (process.env.NODE_ENV === 'development') response.stack = err.stack;

  res.status(statusCode).json(response);
};

export default errorHandler;
