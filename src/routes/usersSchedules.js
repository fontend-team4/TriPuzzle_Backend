import express from "express";
const router = express.Router();
import { authenticate } from "../middlewares/auth.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 尋找共編行程（根據create_by）
router.get("/:id", authenticate, async (req, res) => {
  const userId = req.params.id; 

  if (!userId || isNaN(userId)) {
    return res.status(400).json({ message: "Invalid userId." });
  }

  try {
    const shareSchedules = await prisma.users_schedules.findMany({
      where: { favorite_user: Number(userId) },
      include: {
        places: true, // 包括景點詳細資料
      },
    });
    res.json(shareSchedules);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching usersSchedules', details: error.message });
  }
});

export { router };
