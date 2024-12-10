import express from 'express';
import prisma from '../configs/db.js'; // 使用相對路徑引入 Prisma Client

const router = express.Router();

// GET: 取得所有 schedule_places
router.get('/', async (req, res) => {
  try {
    const schedulePlaces = await prisma.schedule_places.findMany({
      include: {
        places: true, // 關聯 place 資料表
        schedules: true, // 關聯 schedule 資料表
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
  const arrivalTime = arrival_time ? new Date(`1970-01-01T${arrival_time}Z`) : undefined;
  const stayTime = stay_time ? new Date(`1970-01-01T${stay_time}Z`) : undefined;
  try {
    const newSchedulePlace = await prisma.schedule_places.create({
      data: {
        place_id,
        schedule_id,
        which_date,
        arrival_time:arrivalTime,
        stay_time:stayTime,
        transportation_way,
        order,
      },
    });
    res.status(201).json(newSchedulePlace);
  } catch (err) {
    console.error('Error details:', err);
    res.status(500).json({ error: '無法新增資料' });  }
});

// PUT: 更新指定的 schedule_place
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { which_date, arrival_time, stay_time, transportation_way, order } = req.body;
  try {
    const updatedSchedulePlace = await prisma.schedule_places.update({
      where: { id: parseInt(id) },
      data: {
        which_date,
        arrival_time,
        stay_time,
        transportation_way,
        order,
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