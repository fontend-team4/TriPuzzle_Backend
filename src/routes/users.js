import express from "express";
import { register, login } from "../router_handler/users.js";
import { registerSchema, loginSchema } from "../schema/users.js";
import { validateRequest } from "../middlewares/validateRequest.js"; // 假設中間件存放在 middlewares 資料夾中
import { prisma } from "../configs/db.js";

const router = express.Router();

// 註冊路由
router.post("/register", validateRequest(registerSchema), register);

// 登入路由
router.post("/login", validateRequest(loginSchema), login);

export { router };
