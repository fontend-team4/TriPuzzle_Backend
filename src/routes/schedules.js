import express from "express";
const router = express.Router();
import { authenticate } from "../middlewares/auth.js";
import { verifyOwner } from "../middlewares/verifyOwner.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 尋找個人行程（根據create_by）
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const rows = await prisma.schedules.findMany({
      where: { create_by: userId },
      include: {
        schedule_places: {
          include: {
            places: true,
          },
        },
      },
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
router.get("/:id", authenticate, verifyOwner("schedules"), async (req, res) => {
  try {
    const scheduleId = parseInt(req.params.id);

    const schedule = await prisma.schedules.findUnique({
      where: { id: scheduleId },
      include: {
        schedule_places: {
          include: {
            places: true,
          },
        },
      },
    });

    if (!schedule) {
      return res.status(404).json({ message: "找不到該行程" });
    }

    res.status(200).json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 讓登入的用戶一自己的身份建立新行程
router.post("/", authenticate, async (req, res) => {
  try {
    const {
      title,
      create_by,
      co_edit_url,
      co_edit_qrcode,
      schedule_note,
      image_url,
      start_date,
      end_date,
      transportation_way,
      places,
    } = req.body;

    const userId = req.user.id;
    // 調整前端輸入時間格式
    const formattedStartDate = new Date(`${start_date}T00:00:00.000Z`);
    const formattedEndDate = new Date(`${end_date}T00:00:00.000Z`);

    const newSchedule = await prisma.schedules.create({
      data: {
        title,
        create_by: userId,
        co_edit_url,
        co_edit_qrcode,
        schedule_note,
        image_url,
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        transportation_way,
        schedule_places: {
          create: places.map((placeId) => ({
            place_id: placeId,
            which_date: formattedStartDate,
          })),
        },
      },
    });

    res.status(201).json({ message: "成功建立新行程", newSchedule });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 更動自己的行程
router.patch(
  "/:id",
  authenticate,
  verifyOwner("schedules"),
  async (req, res) => {
    try {
      const {
        title,
        schedule_note,
        image_url,
        start_date,
        end_date,
        transportation_way,
        places,
      } = req.body;

      const formattedStartDate = start_date
        ? new Date(`${start_date}T00:00:00.000Z`)
        : undefined;
      const formattedEndDate = end_date
        ? new Date(`${end_date}T00:00:00.000Z`)
        : undefined;

      // 更新行程
      const updatedSchedule = await prisma.schedules.update({
        where: { id: req.resource.id },
        data: {
          ...(title && { title }),
          ...(schedule_note && { schedule_note }),
          ...(image_url && { image_url }),
          ...(formattedStartDate && { start_date: formattedStartDate }),
          ...(formattedEndDate && { end_date: formattedEndDate }),
          ...(transportation_way && { transportation_way }),
        },
      });
      // 如果傳入 `places`，則更新 schedule_places 資料
      if (places && places.length > 0) {
        for (const place of places) {
          await prisma.schedule_places.upsert({
            where: {
              schedule_id_place_id: {
                schedule_id: req.resource.id,
                place_id: place.place_id,
              },
            },
            update: {
              which_date: new Date(place.which_date),
              arrival_time: place.arrival_time
                ? new Date(place.arrival_time)
                : null,
              stay_time: place.stay_time ? new Date(place.stay_time) : null,
              transportation_way:
                place.transportation_way || "PUBLIC_TRANSPORT",
              order: place.order,
            },
            create: {
              schedule_id: req.resource.id,
              place_id: place.place_id,
              which_date: new Date(place.which_date),
              arrival_time: place.arrival_time
                ? new Date(place.arrival_time)
                : null,
              stay_time: place.stay_time ? new Date(place.stay_time) : null,
              transportation_way:
                place.transportation_way || "PUBLIC_TRANSPORT",
              order: place.order,
            },
          });
        }
      }
      res.status(200).json({
        message: "行程更新成功",
        updatedSchedule,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// 刪除自己的行程
router.delete(
  "/:id",
  authenticate,
  verifyOwner("schedules"),
  async (req, res) => {
    try {
      await prisma.schedules.delete({
        where: {
          id: parseInt(req.params.id),
        },
      });
      res.json({ message: "成功刪除" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export { router };
