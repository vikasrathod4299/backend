import { AnyZodObject, ZodError } from "zod"
import { Request, Response, NextFunction } from "express"

export const validate = (schema: AnyZodObject) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    message: "Validation failed",
                    errors: error.errors.map((err) => ({
                        field: err.path.join("."),
                        message: err.message,
                    })),
                });
            } else {
                next(error);
            }
        }
    };
};