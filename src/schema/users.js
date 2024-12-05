import { z } from "zod";

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .regex(/^[^\s]+$/, "Password must not contain spaces"),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    // phone: z.number().positive().optional(),
  }),
});

export { registerSchema, loginSchema };

// import { z } from "zod";

// const registerSchema = z.object({
//   body: z.object({
//     name: z
//       .string({ required_error: "請輸入使用者暱稱" })
//       .min(1, "暱稱為必填項目"),
//     email: z.string({ required_error: "請輸入信箱" }).email("信箱格式不正確"),
//     password: z
//       .string({ required_error: "請輸入密碼" })
//       .min(6, "密碼至少需要 6 個字元")
//       .regex(/^[^\s]+$/, "密碼不可包含空白字元"),
//   }),
// });

// const loginSchema = z
//   .object({
//     name: z.string().optional(),
//     email: z.string().email("信箱格式不正確").optional(),
//     password: z
//       .string({ required_error: "請輸入密碼" })
//       .min(6, "密碼至少需要 6 個字元"),
//   })
//   .superRefine((data, ctx) => {
//     if (!data.email && !data.name) {
//       ctx.addIssue({
//         path: ["email"], // 錯誤附加到 email
//         message: "請輸入使用者暱稱或信箱",
//       });
//     }
//   });

// export { registerSchema, loginSchema };
