import express from "express";
import cors from "cors";
import { expressjwt } from "express-jwt";
import { ZodError } from "zod";

import { router as usersRouter } from "./src/routes/users.js"; // 假設你的 usersRouter 路由在 src/routes/users.js
import { config } from "./config.js";

const app = express();

// CORS 設定
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 統一處理 res.error 錯誤處理函數
app.use((req, res, next) => {
  res.errmessage = function (err, status = 400) {
    res.send({
      status,
      message: err instanceof Error ? err.message : err,
    });
  };
  next();
});

// 路由之前配置解析 Token 的中間件
app.use(
  expressjwt({ secret: config.jwtSecretKey, algorithms: ["HS256"] }).unless({
    path: [/^\/api/, /^\/users/], // 不需要驗證的路徑
  })
);

// 首頁路由
app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

// 用戶路由
app.use("/users", usersRouter);

// 全局錯誤處理中間件
app.use((err, req, res, next) => {
  // Zod 驗證錯誤處理
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => e.message).join(", ");
    return res.errmessage(`Validation error: ${errors}`);
  }

  // JWT 身分認證錯誤處理
  if (err.name === "UnauthorizedError") {
    return res.errmessage("身分認證失敗");
  }

  // 其他錯誤
  res.errmessage(err);
});

// 啟動伺服器
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
