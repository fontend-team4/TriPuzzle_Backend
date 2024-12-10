import express from "express";
const router = express.Router()
// import { prisma } from "../configs/db.js";
import { authenticate } from "../middlewares/auth.js"
import { verifyOwner } from "../middlewares/verifyOwner.js"

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient(); // 必須確保 PrismaClient 被正確實例化


// 尋找個人行程（根據create_by）
// http://localhost:3000/schedules
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id; // 從 JWT 中獲取當前用戶的 ID

    const rows = await prisma.schedules.findMany({
      where: { create_by: userId }, // 只查詢 create_by 為當前用戶的行程
    });

    if (rows.length === 0) {
      return res.status(404).json({ message: "找不到您的行程" });
    }

    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 尋找單一行程（只能找到自己的，只是為了把每個schedule編號用）
// http://localhost:3000/schedules/:id
router.get("/:id", authenticate, verifyOwner("schedules"), (req, res) => {
  res.status(200).json(req.resource); // 使用中間件附加的資源
});

  
// 讓登入的用戶一自己的身份建立新行程
router.post('/' , authenticate ,async (req, res) => {
    try {
      const {
        title,
        create_by,
        co_edit_url,
        co_edit_qrcode,
        schedule_note,
        img_url,
        start_date,
        end_date,
        transportation_way,
      } = req.body;
  
      const userId = req.user.id;
      // 調整前端輸入時間格式
      const formattedStartDate = new Date(`${start_date}T00:00:00.000Z`);
      const formattedEndDate = new Date(`${end_date}T00:00:00.000Z`);

      await prisma.schedules.create({
        data: {
          title,
          create_by : userId,
          co_edit_url,
          co_edit_qrcode,
          schedule_note,
          img_url,
          start_date:formattedStartDate,
          end_date:formattedEndDate,
          transportation_way,
        },
      });
  
      res.status(201).json({ message: '成功建立新行程' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  

// 更動自己的行程
  router.patch("/:id", authenticate, verifyOwner("schedules"), async (req, res) => {
    try {
      const {
        title,
        schedule_note,
        img_url,
        start_date,
        end_date,
        transportation_way,
      } = req.body;
  
      const formattedStartDate = start_date ? new Date(`${start_date}T00:00:00.000Z`) : undefined;
      const formattedEndDate = end_date ? new Date(`${end_date}T00:00:00.000Z`) : undefined;
  
      // 更新行程
      const updatedSchedule = await prisma.schedules.update({
        where: { id: req.resource.id }, // 使用中間件附加的資源
        data: {
          ...(title && { title }),
          ...(schedule_note && { schedule_note }),
          ...(img_url && { img_url }),
          ...(formattedStartDate && { start_date: formattedStartDate }),
          ...(formattedEndDate && { end_date: formattedEndDate }),
          ...(transportation_way && { transportation_way, })
        },
      });
  
      res.status(200).json({
        message: "行程更新成功",
        updatedSchedule,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// 刪除自己的行程
  router.delete("/:id", authenticate, verifyOwner("schedules"),async(req, res) =>{
    try {

      await prisma.schedules.delete({
        where: {
          id: parseInt(req.params.id)
        }
      })
      res.json({ message: '成功刪除' })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })
  

  export { router };