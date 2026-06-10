import { type Request, type Response, type NextFunction } from "express";
import { ZodSchema } from "zod";
import { logger } from "./logger";

/**
 * Express middleware for validating request body against a Zod schema
 * Returns 400 with structured error response if validation fails
 */
export function validateRequestBody<T>(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      logger.warn(
        { path: req.path, errors: result.error.flatten() },
        "Request validation failed"
      );

      res.status(400).json({
        code: "INVALID_REQUEST",
        message: "Request body validation failed",
        details: {
          issues: result.error.flatten().fieldErrors,
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Attach validated data to request for next middleware
    (req as any).validatedBody = result.data;
    next();
  };
}

/**
 * Express middleware for validating query parameters against a Zod schema
 * Returns 400 with structured error response if validation fails
 */
export function validateQuery<T>(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      logger.warn(
        { path: req.path, errors: result.error.flatten() },
        "Query validation failed"
      );

      res.status(400).json({
        code: "INVALID_QUERY",
        message: "Query parameters validation failed",
        details: {
          issues: result.error.flatten().fieldErrors,
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    (req as any).validatedQuery = result.data;
    next();
  };
}

/**
 * Express middleware for validating URL parameters against a Zod schema
 * Returns 400 with structured error response if validation fails
 */
export function validateParams<T>(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      logger.warn(
        { path: req.path, errors: result.error.flatten() },
        "Params validation failed"
      );

      res.status(400).json({
        code: "INVALID_PARAMS",
        message: "URL parameters validation failed",
        details: {
          issues: result.error.flatten().fieldErrors,
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    (req as any).validatedParams = result.data;
    next();
  };
}
