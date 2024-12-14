import { ZodError } from "zod";

const validateRequest = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
    });
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      }));

      return res.status(400).json({
        status: 400,
        message: errors[0]?.message || "驗證失敗",
        errors,
      });
    }
    next(err);
  }
};

export { validateRequest };
