import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// 新增收藏
router.post('/', authenticate, async (req, res) => {
  const { favorite_user, favorite_places } = req.body;

  try {
    // 檢查使用者是否存在
    const user = await prisma.users.findUnique({ where: { id: favorite_user } });
    if (!user) {
      return res.status(400).json({ message: '使用者不存在' });
    }

    // 檢查地點是否存在
    const place = await prisma.places.findUnique({ where: { place_id: favorite_places } }); // 使用 place_id 查詢
    if (!place) {
      return res.status(400).json({ message: '景點不存在，請先新增景點' });
    }

    // 檢查是否已存在收藏
    const existingFavorite = await prisma.favorites.findUnique({
      where: {
        favorite_user_favorite_places: {
          favorite_user,
          favorite_places, // 確保類型為 String
        },
      },
    });

    if (existingFavorite) {
      return res.status(400).json({ message: '該收藏已存在' });
    }

    // 新增收藏
    const favorite = await prisma.favorites.create({
      data: {
        favorite_user,
        favorite_places,
      },
    });

    res.json({ message: '已新增收藏', favorite });
  } catch (error) {
    console.error('新增收藏時發生錯誤:', error);
    res.status(500).json({ error: 'Error adding favorite', details: error.message });
  }
});

// 刪除收藏
router.delete('/', authenticate, async (req, res) => {
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
    console.error('移除收藏時發生錯誤:', error);
    res.status(500).json({ error: 'Error removing favorite', details: error.message });
  }
});

// 取得用戶收藏的所有景點
router.get("/:id", authenticate, async (req, res) => {
  const userId = req.params.id; // 使用路由參數

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
    console.error('取得收藏時發生錯誤:', error);
    res.status(500).json({ error: 'Error fetching favorites', details: error.message });
  }
});


export { router };
