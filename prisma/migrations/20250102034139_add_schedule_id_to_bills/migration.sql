/*
  Warnings:

  - Added the required column `schedule_id` to the `bills` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `bills` ADD COLUMN `schedule_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `bills` ADD CONSTRAINT `bills_schedule_id_fkey` FOREIGN KEY (`schedule_id`) REFERENCES `schedules`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
