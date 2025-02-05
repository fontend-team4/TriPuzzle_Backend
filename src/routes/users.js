import express from "express";
import { register, login,logout , check } from "../router_handler/users.js";
import { registerSchema, loginSchema, } from "../schema/users.js";
import { validateRequest } from "../middlewares/validateRequest.js"; // 假設中間件存放在 middlewares 資料夾中
import { authenticator } from "../middlewares/authenticator.js";
import { prisma } from "../configs/db.js";


const router = express.Router();

// 註冊路由
router.post("/register", validateRequest(registerSchema), register);

// 登入路由
router.post("/login", validateRequest(loginSchema), login);

// 檢查登入狀態路由
router.get('/check', authenticator, check);

router.get("/:id", authenticator, async (req, res) => {
  const userId = parseInt(req.params.id);

  // ✅ 檢查是否有權限查看該用戶
  if (req.user.id !== userId) {
    return res.status(403).json({ message: "無權限查看該用戶" });
  }

  const user = await prisma.users.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return res.status(404).json({ message: "用戶不存在" });
  }

  res.json(user);
});



// 登出路由
router.delete('/logout',logout);

export { router };
