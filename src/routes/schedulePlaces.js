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
    const arrivalDateTime = new Date(`${which_date}T${arrival_time}Z`);
    const stayDuration = new Date(`1970-01-01T${stay_time}Z`);
    const newSchedulePlace = await prisma.schedule_places.create({
      data: {
        place_id,
        schedule_id,
        which_date: new Date(which_date),
        arrival_time: arrivalDateTime,
        stay_time: stayDuration,
        transportation_way,
        order: order.toString(),
      },
      include: {
        places: true,
        schedules: true
      },
    });
    res.status(201).json(newSchedulePlace);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '新增資料時發生錯誤', details: err.message });
  }
});

// PUT: 更新指定的 schedule_place
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    which_date,
    arrival_time,
    stay_time,
    transportation_way,
    order,
  } = req.body;
  try {
    const updatedSchedulePlace = await prisma.schedule_places.update({
      where: {
        id: parseInt(id),
      },
      data: {
        which_date: new Date(which_date),
        arrival_time: new Date(`${which_date}T${arrival_time}Z`),
        stay_time: new Date(`1970-01-01T${stay_time}Z`),
        transportation_way,
        order: order.toString(),
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
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedSchedulePlace = await prisma.schedule_places.delete({
      where: {
        id: parseInt(id),
      },
    });
    res.status(200).json({
      message: '資料刪除成功',
      deletedSchedulePlace,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: '刪除資料時發生錯誤',
      details: err.message,
    });
  }
});

export default router;