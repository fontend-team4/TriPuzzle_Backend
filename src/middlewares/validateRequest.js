import { ZodError } from "zod";

export const validateRequest = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.errors.map((e) => e.message).join(", ");
      return res.status(400).json({ status: 400, message: errors });
    }
    next(err);
  }
};
