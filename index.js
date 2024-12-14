import express from "express";
import passport from "passport";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
// import usersRouter from "./src/routes/users.js";
import authRoutes from "./src/routes/auth.js";
import "./src/configs/passport.js";
import { expressjwt } from "express-jwt";
import { ZodError } from "zod";
import { router as schedulesRouter } from "./src/routes/schedules.js";
// import { authenticate } from "./src/middlewares/auth.js";
// import { authenticator } from "./src/middlewares/authenticator.js";
import { router as usersRouter } from "./src/routes/users.js";
import { router as favoritesRouter } from "./src/routes/favorites.js"; 
import { config } from "./config.js";

const router = express.Router();
dotenv.config();

const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/users", usersRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

// CORS 設定
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  next();
});

// 路由之前配置解析 Token 的中間件
app.use(
  // authenticator,
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
app.use("/schedules", schedulesRouter); // 確保路徑與導入正確
app.use("/favorites", favoritesRouter); 



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

// 啟動伺服器
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
