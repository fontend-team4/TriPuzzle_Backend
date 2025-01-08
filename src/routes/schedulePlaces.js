import express from "express";
import { prisma } from "../configs/db.js";
import { authenticator as authenticate } from "../middlewares/authenticator.js";
import { verifyOwner } from "../middlewares/verifyOwner.js";
import { getDirections, getDistanceMatrix } from "../services/googleMaps.js";

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  const { schedule_id } = req.query;
  try {
    const schedulePlaces = await prisma.schedule_places.findMany({
      where: {
        schedule_id: parseInt(schedule_id),
      },
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

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const deleted = await prisma.schedule_places.delete({
      where: { id },
    });
    res.status(200).json({ message: "刪除成功", deleted });
  } catch (err) {
    res.status(500).json({ error: "刪除失敗", details: err.message });
  }
});

// 獲取特定日期的景點
router.get("/byDate/:scheduleId/:date", authenticate, async (req, res) => {
  const { scheduleId, date } = req.params;

  try {
    const places = await prisma.schedule_places.findMany({
      where: {
        schedule_id: parseInt(scheduleId),
        which_date: new Date(date),
      },
      include: {
        places: true,
        schedules: true,
      },
      orderBy: {
        order: "asc",
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

router.post("/", authenticate, async (req, res) => {
  const {
    id,
    place_id,
    schedule_id,
    which_date,
    stay_time,
    transportation_way,
    order,
  } = req.body;

  try {
    await prisma.$transaction(async (prisma) => {
      const existingPlaces = await prisma.schedule_places.findMany({
        where: {
          schedule_id,
          which_date: new Date(which_date),
        },
        include: {
          places: true,
        },
        orderBy: {
          order: "asc",
        },
      });

      // 更新受影響景點的順序(order)
      if (!id) {
        await Promise.all(
          existingPlaces
            .filter((place) => place.order >= order)
            .map((place) =>
              prisma.schedule_places.update({
                where: { id: place.id },
                data: {
                  order: {
                    increment: 1,
                  },
                },
              })
            )
        );
      }
      const formatTimeOnly = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        return `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
      };

      let formattedDuration = null;
      if (order > 0) {
        const prevPlace = existingPlaces[order - 1];
        const distanceMatrix = await getDistanceMatrix(
          [`place_id:${prevPlace?.place_id}`],
          [`place_id:${place_id}`],
          transportation_way === "CAR" || transportation_way === "MOTOBIKE"
            ? "driving"
            : "walking"
        );

        if (distanceMatrix?.[0]?.elements[0]?.duration) {
          const durationInSeconds =
            distanceMatrix[0].elements[0].duration.value;
          formattedDuration = formatTimeOnly(durationInSeconds);
        }
      }

      // 統一修正new Date成UTC格式
      const calculateNewArrivalTime = (
        prevArrivalTime,
        prevStayTime,
        formattedDuration
      ) => {
        const prevHours = prevArrivalTime.getUTCHours();
        const prevMinutes = prevArrivalTime.getUTCMinutes();
        const prevSeconds = prevArrivalTime.getUTCSeconds();

        const stayHours = prevStayTime.getUTCHours();
        const stayMinutes = prevStayTime.getUTCMinutes();
        const staySeconds = prevStayTime.getUTCSeconds();

        const [durationHours, durationMinutes, durationSeconds] =
          formattedDuration
            ? formattedDuration.split(":").map(Number)
            : [0, 0, 0];

        let totalSeconds = prevSeconds + staySeconds + durationSeconds;
        let addMinutes = Math.floor(totalSeconds / 60);
        totalSeconds = totalSeconds % 60;

        let totalMinutes =
          prevMinutes + stayMinutes + durationMinutes + addMinutes;
        let addHours = Math.floor(totalMinutes / 60);
        totalMinutes = totalMinutes % 60;

        let totalHours = prevHours + stayHours + durationHours + addHours;

        const newDate = new Date(prevArrivalTime);
        newDate.setUTCHours(totalHours, totalMinutes, totalSeconds);

        return newDate;
      };

      let newArrivalTime = null;
      if (order === 0) {
        newArrivalTime = new Date(`${which_date}T08:00:00Z`);
      } else if (order > 0 && existingPlaces[order - 1]) {
        const prevPlace = existingPlaces[order - 1];
        newArrivalTime = calculateNewArrivalTime(
          new Date(prevPlace.arrival_time),
          new Date(prevPlace.stay_time),
          formattedDuration
        );
      }

      // upsert新增或更新景點
      const upsertedSchedulePlace = await prisma.schedule_places.upsert({
        where: {
          id: id ?? -1, // 使用 -1，確定 id 不存在時應直接進行 create
        },
        update: {
          place_id,
          schedule_id,
          which_date: new Date(which_date),
          arrival_time: newArrivalTime,
          stay_time: stay_time
            ? new Date(`1970-01-01T${stay_time}Z`)
            : undefined,
          duration: formattedDuration
            ? new Date(`1970-01-01T${formattedDuration}Z`)
            : null,
          transportation_way,
          order,
        },
        create: {
          place_id,
          schedule_id,
          which_date: new Date(which_date),
          arrival_time: newArrivalTime,
          stay_time: stay_time
            ? new Date(`1970-01-01T${stay_time}Z`)
            : undefined,
          duration: formattedDuration
            ? new Date(`1970-01-01T${formattedDuration}Z`)
            : null,
          transportation_way: transportation_way || "Customize",
          order,
        },
        include: {
          places: true,
          schedules: true,
        },
      });

      // 如果新增/拖曳景點，重新計算/更新後續景點的時間
      if (order < existingPlaces.length) {
        // const needsTimeUpdate = id
        //   ? existingPlaces.find((p) => p.id === id)?.order !== order // 如果是更新，檢查順序是否真的改變
        //   : true; // 如果是新增，一定需要更新
        // if (needsTimeUpdate) {
        const affectedPlaces = existingPlaces.filter(
          (place) => place.order >= order
        );
        let lastPlace = upsertedSchedulePlace;

        for (let nextPlace of affectedPlaces) {
          const newDistanceMatrix = await getDistanceMatrix(
            [`place_id:${lastPlace.place_id}`],
            [`place_id:${nextPlace.place_id}`],
            transportation_way === "CAR" || transportation_way === "MOTOBIKE"
              ? "driving"
              : "walking"
          );

          if (newDistanceMatrix?.[0]?.elements[0]?.duration) {
            const durationInSeconds =
              newDistanceMatrix[0].elements[0].duration.value;
            const newFormattedDuration = formatTimeOnly(durationInSeconds);

            // 取得前一個景點的時間資訊
            const lastArrivalTime = new Date(lastPlace.arrival_time);
            const lastStayTime = new Date(lastPlace.stay_time);

            // 計算新的到達時間（考慮前一個景點的到達時間、停留時間和交通時間）
            const newArrivalTime = calculateNewArrivalTime(
              lastArrivalTime,
              lastStayTime,
              newFormattedDuration
            );

            const updatePlace = await prisma.schedule_places.update({
              where: { id: nextPlace.id },
              data: {
                arrival_time: newArrivalTime,
                duration: new Date(`1970-01-01T${newFormattedDuration}Z`),
              },
              include: {
                places: true,
              },
            });

            lastPlace = updatePlace;
          }
        }
        // }
      }

      return upsertedSchedulePlace;
    });

    res.status(200).json({ message: "新增/更新景點成功" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({
      error: "更新或新增資料時發生錯誤",
      details: err.message,
    });
  }
});

export { router };
