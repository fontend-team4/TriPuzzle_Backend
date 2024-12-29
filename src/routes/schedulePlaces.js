import express from "express";
import { prisma } from "../configs/db.js";
import { authenticator as authenticate } from "../middlewares/authenticator.js";
import { verifyOwner } from "../middlewares/verifyOwner.js";

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const schedulePlaces = await prisma.schedule_places.findMany({
      include: {
        places: true,
        schedules: true,
      },
    });
    res.status(200).json(schedulePlaces);
  } catch (err) {
    res.status(500).json({ error: "無法取得資料" });
  }
});

// 獲取特定日期的景點
router.get("/byDate/:scheduleId/:date", async (req, res) => {
  const { scheduleId, date } = req.params;

  try {
    const places = await prisma.schedule_places.findMany({
      where: {
        schedule_id: parseInt(scheduleId),
        which_date: new Date(date),
      },
      include: {
        places: true,
      },
      orderBy: {
        position: "asc",
      },
    });

    res.status(200).json(places);
  } catch (error) {
    console.error("Error fetching places by date:", error);
    res.status(500).json({
      error: "獲取景點資料失敗",
      details: error.message,
    });
  }
});

router.post("/", async (req, res) => {
  const {
    id,
    place_id,
    schedule_id,
    which_date,
    arrival_time,
    stay_time,
    transportation_way,
    order,
    position,
  } = req.body;

  try {
    // 開啟事務處理
    await prisma.$transaction(async (prisma) => {
      // 1. 獲取該日期的所有景點
      const existingPlaces = await prisma.schedule_places.findMany({
        where: {
          schedule_id,
          which_date: new Date(which_date),
        },
        orderBy: {
          position: "asc",
        },
      });
      // 2. 更新受影響景點的 position
      if (!id) {
        // 只在新增時調整其他景點的位置
        await Promise.all(
          existingPlaces
            .filter((place) => place.position >= position)
            .map((place) =>
              prisma.schedule_places.update({
                where: { id: place.id },
                data: {
                  position: {
                    increment: 1,
                  },
                },
              })
            )
        );
      }

      const upsertedSchedulePlace = await prisma.schedule_places.upsert({
        where: {
          id: id ?? -1, // 使用 -1，確定 id 不存在時應直接進行 create
        },
        update: {
          ...(place_id && { place_id }),
          ...(schedule_id && { schedule_id }),
          ...(which_date && { which_date: new Date(which_date) }),
          ...(arrival_time && {
            arrival_time: new Date(`${which_date}T${arrival_time}Z`),
          }),
          ...(stay_time && { stay_time: new Date(`1970-01-01T${stay_time}Z`) }),
          ...(transportation_way && { transportation_way }),
          ...(order && { order: order.toString() }),
          ...(position !== undefined && { position }),
        },
        create: {
          place_id,
          schedule_id,
          which_date: new Date(which_date),
          arrival_time: arrival_time
            ? new Date(`${which_date}T${arrival_time}Z`)
            : null,
          stay_time: stay_time ? new Date(`1970-01-01T${stay_time}Z`) : null,
          transportation_way: transportation_way || "Customize",
          order: order?.toString() || Date.now().toString(),
          position: position || 0,
        },
        include: {
          places: true,
          schedules: true,
        },
      });

      return upsertedSchedulePlace;
    });

    res.status(200).json({ message: "操作成功" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({
      error: "更新或新增資料時發生錯誤",
      details: err.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedSchedulePlace = await prisma.schedule_places.delete({
      where: {
        id: parseInt(id),
      },
    });
    res.status(200).json({
      message: "資料刪除成功",
      deletedSchedulePlace,
    });
  } catch (err) {
    res.status(500).json({
      error: "刪除資料時發生錯誤",
      details: err.message,
    });
  }
});

export { router };
