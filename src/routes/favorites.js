import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// 新增或移除收藏
router.post("/", authenticate, async (req, res) => {
  const userId = req.user.id;
  const placeId = parseInt(req.body.placeId, 10);

  if (!userId || isNaN(userId)) {
    return res.status(400).json({ message: "Invalid userId." });
  }

  if (isNaN(placeId)) {
    return res.status(400).json({ message: "Invalid placeId." });
  }

  try {
    // 驗證 userId 和 placeId 的存在
    const userExists = await prisma.users.findUnique({ where: { id: userId } });
    const placeExists = await prisma.places.findUnique({ where: { id: placeId } });

    if (!userExists) return res.status(404).json({ message: "User not found." });
    if (!placeExists) return res.status(404).json({ message: "Place not found." });

    // 檢查是否已收藏
    const existingFavorite = await prisma.favorites.findUnique({
      where: { favorite_user_favorite_places: { favorite_user: userId, favorite_places: placeId } },
    });

    if (existingFavorite) {
      // 刪除收藏
      await prisma.favorites.delete({
        where: { favorite_user_favorite_places: { favorite_user: userId, favorite_places: placeId } },
      });
      return res.status(200).json({ message: "Place removed from favorites." });
    }

    // 新增收藏
    const favorite = await prisma.favorites.create({
      data: { favorite_user: userId, favorite_places: placeId },
    });

    res.status(201).json({ message: "Place favorited successfully.", favorite });
  } catch (error) {
    console.error("Error in toggling favorites:", error);
    res.status(500).json({ message: "An error occurred.", error });
  }
});

// 取得用戶收藏的所有景點
router.get("/", authenticate, async (req, res) => {
  const userId = req.user?.id;

  if (!userId || isNaN(userId)) {
    return res.status(400).json({ message: "Invalid userId." });
  }

  try {
    const favorites = await prisma.favorites.findMany({
      where: { favorite_user: userId },
      include: { places: true }, // 正確的 include 關聯
    });

    res.status(200).json({ favorites });
  } catch (error) {
    console.error("Error in retrieving favorites:", error);
    res.status(500).json({ message: "An error occurred.", error });
  }
});

export { router };
