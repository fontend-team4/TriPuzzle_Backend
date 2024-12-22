import express from "express";
import { authenticator as authenticate } from "../middlewares/authenticator.js";
// import { authenticate } from "../middlewares/auth.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// GET User Profile
router.get("/profile/:id", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const resourceId = parseInt(req.params.id); // 從 URL 中取得資源 ID

    // 確認網址中的 id 與當前使用者 id 相同
    if (userId !== resourceId) {
      return res.status(401).json({ message: "User Unauthorized" });
    }

    const rows = await prisma.users.findUnique({
      where: { id: userId },
    });

    res.json({
      message: "Get user profile successful",
      data: rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH User Profile
router.patch("/profile/:id", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const resourceId = parseInt(req.params.id); // 從 URL 中取得資源 ID

    // 確認是否為本人
    if (userId !== resourceId) {
      return res.status(401).json({ message: "User Unauthorized" });
    }

    const {
      name,
      email,
      profile_pic_url,
      phone,
      gender,
      birthday,
      description,
    } = req.body;

    const updatedData = await prisma.users.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(profile_pic_url && { profile_pic_url }),
        ...(phone && { phone }),
        ...(gender && { gender }),
        ...(birthday && { birthday }),
        ...(description && { description }),
      },
    });

    res.json({
      message: "User update successful",
      updatedData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE User Profile
router.delete("/profile/:id", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const resourceId = parseInt(req.params.id); // 從 URL 中取得資源 ID

    // 確認是否為本人
    if (userId !== resourceId) {
      return res.status(401).json({ message: "User Unauthorized" });
    }

    await prisma.users.delete({
      where: { id: userId },
    });

    res.json({
      message: `成功刪除 ID:${userId} 使用者`,
      data: {},
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export { router };
