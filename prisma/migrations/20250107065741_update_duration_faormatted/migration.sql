/*
  Warnings:

  - You are about to alter the column `duration` on the `schedule_places` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Time(0)`.

*/
-- AlterTable
ALTER TABLE `schedule_places` MODIFY `duration` TIME(0) NULL DEFAULT '00:00:00';
