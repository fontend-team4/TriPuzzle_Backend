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
  const {
    place_id,
    schedule_id,
    which_date,
    arrival_time,
    stay_time,
    transportation_way,
    order
  } = req.body;

  try {
    // 驗證必填欄位
    if (!place_id || !schedule_id || !which_date || !arrival_time || !stay_time || !transportation_way || !order) {
      return res.status(400).json({ error: '缺少必要欄位' });
    }
    // 格式轉換
    const arrivalDateTime = new Date(`${which_date}T${arrival_time}Z`);
    const stayDuration = new Date(`1970-01-01T${stay_time}Z`);

    if (isNaN(arrivalDateTime) || isNaN(stayDuration)) {
      return res.status(400).json({ error: '日期或時間格式無效' });
    }

    // 新增資料到 schedule_places 表
    const newSchedulePlace = await prisma.schedule_places.create({
      data: {
        place_id,
        schedule_id,
        which_date: new Date(which_date), // 日期格式
        arrival_time: arrivalDateTime,    // 到達時間
        stay_time: stayDuration,          // 停留時間
        transportation_way,
        order: order.toString(),
      },
      include: {
        places: true,   // 包含 places 的關聯資料
        schedules: true // 包含 schedules 的關聯資料
      },
    });

    res.status(201).json(newSchedulePlace); // 回傳新增的資料
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '新增資料時發生錯誤', details: err.message });
  }
});

// PUT: 更新指定的 schedule_place
router.put('/:schedule_id/:place_id', async (req, res) => {
  const { order } = req.body; // 確保提供唯一的 order
  const {
    which_date,
    arrival_time,
    stay_time,
    transportation_way
  } = req.body;
  try {
    const updatedSchedulePlace = await prisma.schedule_places.update({
      where: {
        order: order.toString(), // 使用唯一的 order
      },
      data: {
        which_date: new Date(which_date),
        arrival_time: new Date(`${which_date}T${arrival_time}Z`),
        stay_time: new Date(`1970-01-01T${stay_time}Z`),
        transportation_way,
      },
      include: {
        places: true,
        schedules: true,
      },
    });
    res.status(200).json(updatedSchedulePlace);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '更新資料時發生錯誤', details: err.message });
  }
});

// DELETE: 刪除指定的 schedule_place
router.delete('/:schedule_id/:place_id', async (req, res) => {
  const { schedule_id, place_id } = req.params;
  try {
    // 使用 delete() 刪除資料，根據 schedule_id 和 place_id 來查詢
    const deletedSchedulePlace = await prisma.schedule_places.deleteMany({
      where: {
        schedule_id: parseInt(schedule_id),
        place_id: parseInt(place_id),
      },
    });
    if (deletedSchedulePlace.count === 0) {
      return res.status(404).json({ error: '找不到要刪除的資料' });
    }
    res.status(200).json({ message: '資料刪除成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '刪除資料時發生錯誤', details: err.message });
  }
});

export default router;