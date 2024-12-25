import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middlewares/auth.js";
import jwt from "jsonwebtoken";

const generateShareToken = (scheduleId) => {
  const payload = { scheduleId };
  const secret = process.env.JWT_SECRET;
  const options = { expiresIn: "7d" };
  return jwt.sign(payload, secret, options);
};

const verifyShareToken = (token) => {
  const secret = process.env.JWT_SECRET;
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error("Invalid or expired share token.");
  }
};

const router = express.Router();
const prisma = new PrismaClient();

// 取得共編行程
router.get("/user/:id", authenticate, async (req, res) => {
  const userId = parseInt(req.params.id, 10);

  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid userId." });
  }

  try {
    const userSchedules = await prisma.users_schedules.findMany({
      where: { user_id: userId },
      include: { schedules: true }, 
    });
    res.json(userSchedules);
  } catch (error) {
    res.status(500).json({
      error: "Error fetching user's schedules.",
      details: error.message,
    });
  }
});

// 加入共編
router.get("/join/:shareToken", authenticate, async (req, res) => {
  const { shareToken } = req.params;
  const userId = req.user.id; // 從 authenticate 中間件獲取使用者 ID

  try {
    // 驗證 share_token 並解析行程 ID
    const { scheduleId } = verifyShareToken(shareToken);

    // 確認行程是否存在
    const schedule = await prisma.schedules.findUnique({
      where: { id: Number(scheduleId) },
    });
    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found." });
    }

    // 檢查使用者是否已加入
    const existingRelation = await prisma.users_schedules.findUnique({
      where: {
        schedule_id_user_id: {
          schedule_id: schedule.id,
          user_id: userId,
        },
      },
    });

    if (existingRelation) {
      return res
        .status(400)
        .json({ error: "User already joined this schedule." });
    }

    // 建立新的關聯
    await prisma.users_schedules.create({
      data: {
        schedule_id: schedule.id,
        user_id: userId,
        access: true, // 設置權限
      },
    });

    res.json({ message: "You have joined the schedule.", schedule });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error joining schedule.", details: error.message });
  }
});

// 生成網址
router.post("/share/:scheduleId", authenticate, async (req, res) => {
  const { scheduleId } = req.params;

  try {
    // 確認行程是否存在
    const schedule = await prisma.schedules.findUnique({
      where: { id: Number(scheduleId) },
    });
    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found." });
    }

    // 生成 share_token
    const shareToken = generateShareToken(schedule.id);

    // 儲存 share_token 到資料庫
    await prisma.schedules.update({
      where: { id: schedule.id },
      data: { share_token: shareToken },
    });

    // 返回分享網址
    const shareUrl = `http://localhost:3000/usersSchedules/join/${shareToken}`;
    res.json({ shareUrl });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error generating share link.", details: error.message });
  }
});

// 退出共編
router.delete("/:id", authenticate, verifyOwner("schedules"), async (req, res) => {
    try {
      const userId = req.user.id; // 請求者的 ID
      const usersSchedulesId = parseInt(req.params.id, 10); // users_schedules 的 ID
  
      if (isNaN(usersSchedulesId)) {
        return res.status(400).json({ message: "無效的 ID" });
      }
  
      // 確認共編是否存在
      const userSchedule = await prisma.users_schedules.findUnique({
        where: { id: usersSchedulesId },
      });
  
      if (!userSchedule) {
        return res.status(404).json({ message: "共編記錄不存在" });
      }
  
      // 確認該行程是否存在
      const schedule = await prisma.schedules.findUnique({
        where: { id: userSchedule.schedule_id },
      });
  
      if (!schedule) {
        return res.status(404).json({ message: "行程不存在" });
      }
  

      const isOwner = schedule.create_by === userId; // 是否為行程創建者
      const isSelf = userSchedule.user_id === userId; // 是否是要退出共編的用戶自己
  
      if (!isOwner && !isSelf) {
        return res.status(403).json({ message: "您無權執行此操作" });
      }
  
 
      if (!isOwner && userSchedule.user_id === schedule.create_by) {
        return res.status(403).json({ message: "共編者無法踢掉行程創建者" });
      }
  

      await prisma.users_schedules.delete({
        where: { id: usersSchedulesId },
      });
  
      res.status(200).json({ message: "成功退出共編" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

export { router };
