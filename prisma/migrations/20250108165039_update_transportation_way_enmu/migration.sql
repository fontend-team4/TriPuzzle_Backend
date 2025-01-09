/*
  Warnings:

  - You are about to alter the column `transportation_way` on the `schedule_places` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `Enum(EnumId(1))`.
  - You are about to alter the column `transportation_way` on the `schedules` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `schedule_places` MODIFY `transportation_way` ENUM('transit', 'walking', 'CAR', 'MOTORBIKE', 'bicycling', 'CUSTOM') NOT NULL DEFAULT 'transit';

-- AlterTable
ALTER TABLE `schedules` MODIFY `transportation_way` ENUM('transit', 'walking', 'CAR', 'MOTORBIKE', 'bicycling', 'CUSTOM') NOT NULL DEFAULT 'transit';
