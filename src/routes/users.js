import express from "express";
import { register, login,logout , check } from "../router_handler/users.js";
import { registerSchema, loginSchema, } from "../schema/users.js";
import { validateRequest } from "../middlewares/validateRequest.js"; // 假設中間件存放在 middlewares 資料夾中
import { authenticator } from "../middlewares/authenticator.js";

const router = express.Router();

// 註冊路由
router.post("/register", validateRequest(registerSchema), register);

// 登入路由
router.post("/login", validateRequest(loginSchema), login);

// 檢查登入狀態路由
router.get('/check', authenticator, check);

// 登出路由
router.delete('/logout',logout);

export { router };
