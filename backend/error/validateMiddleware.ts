import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

const formatZodErrors = (error: ZodError) => {
  return error.issues.map((issue) => {
    const path = issue.path.join(".");

    return {
      field: path.replace(/^body\./, "").replace(/^query\./, "").replace(/^params\./, ""),
      location: issue.path[0] || "unknown",
      message: issue.message,
    };
  });
};


export type RequestValidationSchema = z.ZodObject<{
  body?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
}>;

export const validate =
  (schema: RequestValidationSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      next();
    } catch (err) {
      next(err);
    }
  };