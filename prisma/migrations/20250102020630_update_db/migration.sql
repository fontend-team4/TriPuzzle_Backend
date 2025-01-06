/*
  Warnings:

  - You are about to alter the column `order` on the `schedule_places` table. The data in that column could be lost. The data in that column will be cast from `VarChar(45)` to `Int`.
  - A unique constraint covering the columns `[share_token]` on the table `schedules` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `users_schedules` DROP FOREIGN KEY `schedules_schedule_id`;

-- DropForeignKey
ALTER TABLE `users_schedules` DROP FOREIGN KEY `schedules_user_id`;

-- DropIndex
DROP INDEX `order_UNIQUE` ON `schedule_places`;

-- AlterTable
ALTER TABLE `places` ADD COLUMN `token` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `schedule_places` MODIFY `stay_time` TIME(0) NULL DEFAULT '01:00:00',
    MODIFY `order` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `schedules` ADD COLUMN `share_token` VARCHAR(225) NULL,
    ADD COLUMN `total_users` INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX `schedules_share_token_key` ON `schedules`(`share_token`);

-- AddForeignKey
ALTER TABLE `users_schedules` ADD CONSTRAINT `users_schedules_schedule_id_fkey` FOREIGN KEY (`schedule_id`) REFERENCES `schedules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users_schedules` ADD CONSTRAINT `users_schedules_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `users_schedules` RENAME INDEX `fk_schedules_id_idx` TO `users_schedules_schedule_id_idx`;

-- RenameIndex
ALTER TABLE `users_schedules` RENAME INDEX `fk_user_id_idx` TO `users_schedules_user_id_idx`;
