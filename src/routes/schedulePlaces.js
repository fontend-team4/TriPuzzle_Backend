import express from 'express';
import prisma from '../configs/db.js';

const router = express.Router();

// GET: 取得所有 schedule_places
router.get('/', async (req, res) => {
  try {
    const schedulePlaces = await prisma.schedule_places.findMany({
      include: {
        places: true,
        schedules: true,
      },
    });
    res.status(200).json(schedulePlaces);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '無法取得資料' });
  }
});

// POST: 新增一筆 schedule_place
router.post('/', async (req, res) => {
  const { schedule_id, place_id, which_date, arrival_time, stay_time, transportation_way, order } = req.body;

  // 處理日期與時間格式
  const parsedWhichDate = which_date ? new Date(which_date) : null;
  if (parsedWhichDate && isNaN(parsedWhichDate)) {
    return res.status(400).json({ error: '無效的日期格式' });
  }

  const arrivalTime = arrival_time ? new Date(`1970-01-01T${arrival_time}Z`) : null;
  if (arrival_time && isNaN(arrivalTime)) {
    return res.status(400).json({ error: '無效的到達時間格式' });
  }

  const stayTime = stay_time ? new Date(`1970-01-01T${stay_time}Z`) : null;
  if (stay_time && isNaN(stayTime)) {
    return res.status(400).json({ error: '無效的停留時間格式' });
  }

  try {
    // 嘗試新增資料至資料庫
    const newSchedulePlace = await prisma.schedule_places.create({
      data: {
        place_id,
        schedule_id,
        which_date: parsedWhichDate,
        arrival_time: arrivalTime,
        stay_time: stayTime,
        transportation_way,
        order,
      },
    });

    // 成功回應新增的資料
    res.status(201).json(newSchedulePlace);
  } catch (err) {
    // 捕獲 Prisma 的唯一性約束錯誤 (P2002)
    if (err.code === 'P2002') {
      console.error('Unique constraint error:', err.meta);
      res.status(400).json({
        error: '資料唯一性約束錯誤',
        details: `欄位 ${err.meta.target} 的值已存在，請提供唯一的值`,
      });
    } else {
      // 捕獲其他未知錯誤
      console.error('Error details:', err);
      res.status(500).json({ error: '無法新增資料', details: err.message });
    }
  }
});

// PUT: 更新指定的 schedule_place
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { which_date, arrival_time, stay_time, transportation_way, order } = req.body;
  const orderString = order ? order.toString() : undefined;
  try {
    const updatedSchedulePlace = await prisma.schedule_places.update({
      where: { id: parseInt(id) },
      data: {
        which_date,
        arrival_time,
        stay_time,
        transportation_way,
        order:orderString,
      },
    });
    res.status(200).json(updatedSchedulePlace);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '無法更新資料' });
  }
});

// DELETE: 刪除指定的 schedule_place
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.schedule_places.delete({
      where: { id: parseInt(id) },
    });
    res.status(200).json({ message: '刪除成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '無法刪除資料' });
  }
});

export default router;