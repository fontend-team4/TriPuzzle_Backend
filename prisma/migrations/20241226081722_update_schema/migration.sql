/*
  Warnings:

  - You are about to alter the column `place_id` on the `schedule_places` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- DropForeignKey
ALTER TABLE `schedule_places` DROP FOREIGN KEY `schedule_place_id`;

-- AlterTable
ALTER TABLE `schedule_places` MODIFY `place_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `schedule_places` ADD CONSTRAINT `schedule_place_id` FOREIGN KEY (`place_id`) REFERENCES `places`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
