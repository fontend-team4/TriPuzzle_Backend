-- DropForeignKey
ALTER TABLE `schedule_places` DROP FOREIGN KEY `schedule_schedule_id`;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `level` VARCHAR(45) NULL;

-- AddForeignKey
ALTER TABLE `schedule_places` ADD CONSTRAINT `schedule_schedule_id` FOREIGN KEY (`schedule_id`) REFERENCES `schedules`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;
