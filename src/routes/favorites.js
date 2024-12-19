import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// 新增收藏
router.post('/',authenticate, async (req, res) => {

  try {
  const { favorite_user, favorite_places } = req.body;
    const favorite = await prisma.favorites.create({
      data: {
        favorite_user,
        favorite_places,
      },
    });
    res.json({ message: '已新增收藏', favorite });
  } catch (error) {
    res.status(500).json({ error: 'Error adding favorite', details: error.message });
  }
});

//刪除收藏
router.delete('/',authenticate, async (req, res) => {
  const { favorite_user, favorite_places } = req.body;

  try {
    await prisma.favorites.delete({
      where: {
        favorite_user_favorite_places: {
          favorite_user,
          favorite_places,
        },
      },
    });
    res.json({ message: '已移除收藏' });
  } catch (error) {
    res.status(500).json({ error: 'Error removing favorite', details: error.message });
  }
});


// 取得用戶收藏的所有景點
router.get("/:id", authenticate, async (req, res) => {
  const userId = req.user?.id;

  if (!userId || isNaN(userId)) {
    return res.status(400).json({ message: "Invalid userId." });
  }

  try {
    const favorites = await prisma.favorites.findMany({
      where: { favorite_user: Number(userId) },
      include: {
        places: true, // 包括景點詳細資料
      },
    });
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching favorites', details: error.message });
  }
});


export { router };
