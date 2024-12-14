import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// 新增或移除收藏
router.post("/", authenticate, async (req, res) => {
  const userId = req.user.id; // 從 token 解碼的使用者 ID
  const { placeId } = req.body;

  try {
    // 檢查是否已收藏
    const existingFavorite = await prisma.favorites.findFirst({
      where: {
        favorite_user: userId,
        favorite_places: placeId,
      },
    });

    if (existingFavorite) {
      // 如果已收藏，則刪除這個收藏
      await prisma.favorites.delete({
        where: {
          id: existingFavorite.id,
        },
      });

      return res.status(200).json({ message: "Place removed from favorites." });
    }

    // 如果尚未收藏，則新增收藏
    const favorite = await prisma.favorites.create({
      data: {
        favorite_user: userId,
        favorite_places: placeId,
      },
    });

    res.status(201).json({ message: "Place favorited successfully.", favorite });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred." });
  }
});

// 取得收藏的所有景點
router.get("/", authenticate, async (req, res) => {
  const userId = req.user.id;

  try {
    const favorites = await prisma.favorites.findMany({
      where: { favorite_user: userId },
      include: { places: true },  // 包括景點的詳細資料
    });

    res.status(200).json({ favorites });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred." });
  }
});

export { router };
