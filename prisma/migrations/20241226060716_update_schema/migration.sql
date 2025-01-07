-- DropForeignKey
ALTER TABLE `schedule_places` DROP FOREIGN KEY `schedule_place_id`;

-- AlterTable
ALTER TABLE `schedule_places` MODIFY `place_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `schedule_places` ADD CONSTRAINT `schedule_place_id` FOREIGN KEY (`place_id`) REFERENCES `places`(`place_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
