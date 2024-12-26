import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middlewares/auth.js";
import { verifyOwner } from "../middlewares/verifyOwner.js";
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
router.get("/", authenticate, async (req, res) => {
  const userId = req.user.id;

  try {
    // 查找共編行程
    const coEditSchedules = await prisma.users_schedules.findMany({
      where: { user_id: userId },
      include: { schedules: true },
    });

    // 格式化共編行程，使其與個人行程結構一致
    const formattedCoEditSchedules = coEditSchedules.map((item) => ({
      ...item.schedules,
    }));

    // 合併個人行程與共編行程

    res.json(formattedCoEditSchedules);
  } catch (error) {
    res.status(500).json({
      error: "Error fetching schedules.",
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

    // 更新 total_users
    await prisma.schedules.update({
      where: { id: scheduleId },
      data: {
        total_users: {
          increment: 1, // 自動加 1
        },
      },
    });

    res.json({ message: "You have joined the schedule.", schedule });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error joining schedule.", details: error.message });
  }
});

// 查詢行程的所有使用者（建立者和共編者）
router.get("/:id/users", authenticate, async (req, res) => {
  const scheduleId = parseInt(req.params.id, 10);

  if (isNaN(scheduleId)) {
    return res.status(400).json({ message: "Invalid scheduleId." });
  }

  try {
    // 查找行程本身，包含建立者的 user_id
    const schedule = await prisma.schedules.findUnique({
      where: { id: scheduleId },
      select: {
        id: true,
        title: true,
        create_by: true,
      },
    });

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found." });
    }

    // 查找建立者詳細資訊
    const creator = await prisma.users.findUnique({
      where: { id: schedule.create_by },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // 查找共編者資訊，通過關聯查詢
    const sharedUsers = await prisma.users_schedules.findMany({
      where: { schedule_id: scheduleId },
      include: {
        users: {
          // 注意這裡改成正確的關聯名稱
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // 計算總人數（創建者 + 共編者）
    const totalUsers = 1 + sharedUsers.length;

    // 整理返回的數據
    const result = {
      schedule_id: schedule.id,
      title: schedule.title,
      creator,
      sharedUsers: sharedUsers.map((item) => item.users), // 取關聯的 `users`
      totalUsers, // 新增欄位
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: "Error fetching schedule users.",
      details: error.message,
    });
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
router.delete("/:scheduleId/:userId", authenticate, async (req, res) => {
  try {
    const scheduleId = parseInt(req.params.scheduleId, 10); // 行程 ID
    const userId = parseInt(req.params.userId, 10); // 用戶 ID (共編者)

    if (isNaN(scheduleId) || isNaN(userId)) {
      return res.status(400).json({ message: "行程 ID 或用戶 ID 無效" });
    }

    const requestUserId = req.user.id; // 請求者 ID

    // 確認行程是否存在
    const schedule = await prisma.schedules.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      return res.status(404).json({ message: "行程不存在" });
    }

    const isOwner = schedule.create_by === requestUserId;
    const isSelf = userId === requestUserId;

    // 防止非創建者刪除行程創建者的共編記錄
    if (!isOwner && userId === schedule.create_by) {
      return res
        .status(403)
        .json({ message: "您無權刪除行程創建者的共編記錄" });
    }

    // 防止非相關者執行操作
    if (!isOwner && !isSelf) {
      return res.status(403).json({ message: "您無權執行此操作" });
    }

    // 確認共編記錄是否存在
    const userSchedule = await prisma.users_schedules.findUnique({
      where: {
        schedule_id_user_id: { schedule_id: scheduleId, user_id: userId },
      },
    });

    if (!userSchedule) {
      return res.status(404).json({ message: "共編記錄不存在" });
    }

    // 刪除共編記錄
    const deleted = await prisma.users_schedules.delete({
      where: {
        schedule_id_user_id: { schedule_id: scheduleId, user_id: userId },
      },
    });

    if (!deleted) {
      return res.status(500).json({ message: "刪除共編記錄失敗" });
    }

    // 更新 total_users
    await prisma.schedules.update({
      where: { id: scheduleId },
      data: {
        total_users: {
          decrement: 1,
        },
      },
    });

    res.status(200).json({ message: "成功退出共編" });
  } catch (err) {
    res.status(500).json({ error: `伺服器錯誤: ${err.message}` });
  }
});

export { router };
