import express from "express";
import passport from "passport";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import { expressjwt } from "express-jwt";
import { ZodError } from "zod";
import { router as schedulesRouter } from "./src/routes/schedules.js";
import { router as usersRouter } from "./src/routes/users.js";
import { config } from "./config.js";
import "./src/configs/passport.js";
import placesRouter from "./src/routes/placesRouter.js";

const router = express.Router()
dotenv.config();
// console.log(process.env);

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    method: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use('/users', usersRouter)
// app.use('/schedules', schedules)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

console.log("JWT Secret Key:", config.jwtSecretKey);


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
  // authenticate, //不需要加在這裡，加在需要用到的routes上就好
  expressjwt({ secret: config.jwtSecretKey, algorithms: ["HS256"] }).unless({
    path: [/^\/api/, /^\/users/], // 不需要驗證的路徑
  })
);

// 用戶路由
app.use("/users", usersRouter);

//places路由
app.use("/places", placesRouter);
app.use("/schedules", schedulesRouter); // 確保路徑與導入正確

// 全局錯誤處理中間件
app.use((err, req, res, next) => {
  // Zod 驗證錯誤處理
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => e.message).join(", ");
    return res.status(400).json({
      status: 400,
      message: `Validation error: ${errors}`,
    });
  }

  // JWT 身分認證錯誤處理
  if (err.name === "UnauthorizedError") {
    const message =
      err.message === "jwt expired"
        ? "Token 已過期，請重新登入"
        : `Authentication failed: ${err.message}`;
    return res.status(401).json({
      status: 401,
      message,
    });
  }

  // 未知錯誤
  res.status(404).json({
    status: 404,
    message: err instanceof Error ? err.message : String(err),
  });
});

app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
