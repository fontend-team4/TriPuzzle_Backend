/*
  Warnings:

  - Made the column `transportation_way` on table `schedule_places` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `schedule_places` MODIFY `transportation_way` ENUM('PUBLIC_TRANSPORT', 'WALK', 'CAR', 'MOTORBIKE', 'CUSTOM') NOT NULL DEFAULT 'PUBLIC_TRANSPORT';

-- AlterTable
ALTER TABLE `schedules` ADD COLUMN `transportation_way` ENUM('PUBLIC_TRANSPORT', 'WALK', 'CAR', 'MOTORBIKE', 'CUSTOM') NOT NULL DEFAULT 'PUBLIC_TRANSPORT';
