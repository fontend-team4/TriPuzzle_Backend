import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// 1. 獲取指定行程的所有帳目 (GET)
router.get('/:scheduleId/bills', authenticate, async (req, res) => {
  const { scheduleId } = req.params;
  try {
    const bills = await prisma.bills.findMany({
      where: { schedule_id: parseInt(scheduleId) },
      include: {
        users_bills: {
          include: {
            users: {
              select: {
                id: true,
                name: true,
                email: true,
                profile_pic_url: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json(
      bills.map((bill) => ({
        ...bill,
        createdByUser: bill.created_by, // 返回創建者 ID
        remarks: bill.remarks || '', // 返回備註欄位
      }))
    );
  } catch (err) {
    console.error('Error:', err); // 顯示完整的 Prisma 錯誤
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// 2. 創建新帳目 (POST)
router.post('/:scheduleId/bills', authenticate, async (req, res) => {
  const { scheduleId } = req.params;
  const { title, price, category, date, created_by, split_among, is_personal, remarks } = req.body;

  try {
    // 創建帳目
    const newBill = await prisma.bills.create({
      data: {
        title,
        price: parseFloat(price),
        category,
        date: new Date(date),
        schedule_id: parseInt(scheduleId),
        created_by: parseInt(created_by),
        split_among: split_among || [],
        is_personal: is_personal || false,
        remarks: remarks || '',
      },
    });

    // 如果需要分攤，創建 `users_bills` 關聯記錄
    if (!is_personal && split_among.length > 0) {
      const usersBillsData = split_among.map((userId) => ({
        user_id: userId,
        bill_id: newBill.id,
        schedule_id: parseInt(scheduleId),
        pay_first: userId === created_by, // 如果是創建者，默認為先付款者
      }));
      await prisma.users_bills.createMany({ data: usersBillsData });
    }

    res.status(201).json({ message: '新增帳目成功', bill: newBill });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 3. 更新帳目 (PUT)
router.put('/:scheduleId/bills/:billId', authenticate, async (req, res) => {
  const { billId, scheduleId } = req.params;
  const { title, price, category, date, created_by, split_among, is_personal, remarks } = req.body;

  try {
    // 更新帳目基本資訊
    const updatedBill = await prisma.bills.update({
      where: { id: parseInt(billId) },
      data: {
        title,
        price: parseFloat(price),
        category,
        date: new Date(date),
        created_by: parseInt(created_by),
        split_among: split_among || [],
        is_personal: is_personal || false,
        remarks: remarks || '',
      },
    });

    // 如果需要更新分攤人員
    if (!is_personal && split_among) {
      await prisma.users_bills.deleteMany({ where: { bill_id: parseInt(billId) } }); // 先刪除原有關聯
      const usersBillsData = split_among.map((userId) => ({
        user_id: userId,
        bill_id: parseInt(billId),
        schedule_id: parseInt(scheduleId),
        pay_first: userId === created_by, // 創建者默認為先付款者
      }));
      await prisma.users_bills.createMany({ data: usersBillsData });
    }

    res.status(200).json({ message: '更新帳目成功', bill: updatedBill });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 4. 刪除帳目 (DELETE)
router.delete('/:scheduleId/bills/:billId', authenticate, async (req, res) => {
  const { billId } = req.params;

  try {
    await prisma.users_bills.deleteMany({ where: { bill_id: parseInt(billId) } }); // 刪除帳目與使用者的關聯記錄
    await prisma.bills.delete({ where: { id: parseInt(billId) } }); // 刪除帳目
    res.status(200).json({ message: '刪除帳目成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 5. 獲取單筆帳目詳細 (GET)
router.get('/:scheduleId/bills/:billId', authenticate, async (req, res) => {
  const { billId } = req.params;

  try {
    const billDetail = await prisma.bills.findUnique({
      where: { id: parseInt(billId) },
      include: {
        users_bills: {
          include: {
            users: {
              select: {
                id: true,
                name: true,
                email: true,
                profile_pic_url: true,
              },
            },
          },
        },
      },
    });

    if (!billDetail) {
      return res.status(404).json({ error: '未找到該帳目' });
    }

    res.status(200).json({
      ...billDetail,
      createdByUser: billDetail.created_by,
      splitAmong: billDetail.split_among,
      remarks: billDetail.remarks,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export { router };
