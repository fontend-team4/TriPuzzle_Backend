
import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middlewares/auth.js";
const router = express.Router();
const prisma = new PrismaClient();

// 創建帳目
router.post('/:groupId/bills', async (req, res) => {
  const { groupId } = req.params;
  const { title, price, category, date, users } = req.body; // users 為參與分帳的用戶 ID

  try {
    // 創建帳目
    const newBill = await prisma.bills.create({
      data: {
        title,
        price,
        category,
        date: new Date(date),
        schedule_id: parseInt(groupId),
      },
    });

    // 創建 users_bills 關聯
    if (users && users.length > 0) {
      const usersBillsData = users.map((userId) => ({
        user_id: userId,
        bill_id: newBill.id,
        schedule_id: parseInt(groupId),
        pay_first: false,
      }));
      await prisma.users_bills.createMany({ data: usersBillsData });
    }

    res.status(201).json({ message: '新增帳目成功', bill: newBill });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 更新帳目
router.put('/:groupId/bills/:billId', async (req, res) => {
  const { billId } = req.params;
  const { title, price, category, date } = req.body;

  try {
    const updatedBill = await prisma.bills.update({
      where: { id: parseInt(billId) },
      data: {
        title,
        price,
        category,
        date: new Date(date),
      },
    });

    res.status(200).json({ message: '更新帳目成功', bill: updatedBill });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 刪除帳目
router.delete('/:groupId/bills/:billId', async (req, res) => {
  const { billId } = req.params;

  try {
    // 刪除相關的 users_bills
    await prisma.users_bills.deleteMany({ where: { bill_id: parseInt(billId) } });

    // 刪除帳目
    await prisma.bills.delete({ where: { id: parseInt(billId) } });

    res.status(200).json({ message: '刪除帳目成功' });
  } catch (err) {
    res.status(500).json({ error: '該帳目已刪除' });
  }
});

// 獲取群組帳目
router.get('/:groupId/bills', async (req, res) => {
  const { groupId } = req.params;

  try {
    const bills = await prisma.bills.findMany({
      where: { schedule_id: parseInt(groupId) },
      include: {
        users_bills: {
          include: {
            users: {
              select: {
                id: true,
                name: true,
                email: true,
                users_images: true, // 獲取圖片
              },
            },
          },
        },
      },
    });

    res.status(200).json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export { router };
