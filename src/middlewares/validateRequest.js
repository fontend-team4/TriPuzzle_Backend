import { ZodError } from "zod";

const validateRequest = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
    });

    next();
  } catch (err) {
    if (err instanceof ZodError) {
      // 收集所有錯誤訊息
      const errors = err.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      }));

      // 返回第一個錯誤訊息
      return res.status(400).json({
        status: 400,
        message: errors[0]?.message || "驗證失敗",
        errors, // 返回所有錯誤
      });
    }

    next(err);
  }
};

export { validateRequest };
