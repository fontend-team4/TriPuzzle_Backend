import { z } from "zod";

const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "請輸入使用者名稱" })
      .min(1, "使用者名稱不能為空")
      .regex(/^[^\s]+$/, "使用者名稱不能包含空白字元"),
    email: z.string({ required_error: "請輸入信箱" }).email("信箱格式不正確"),
    password: z
      .string({ required_error: "請輸入密碼" })
      .min(6, "密碼至少需要 6 個字元")
      .regex(/^[^\s]+$/, "密碼不能包含空白字元"),
  }),
});

const loginSchema = z.object({
  body: z.object({
    identifier: z.string().nonempty("請輸入帳號、信箱或電話"), // 通用識別欄位(增加使用者登入彈性)
    password: z
      .string({ required_error: "請輸入密碼" })
      .min(6, "密碼至少需要 6 個字元"),
  }),
});

export { registerSchema, loginSchema };
