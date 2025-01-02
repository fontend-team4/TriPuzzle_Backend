/*
  Warnings:

  - You are about to drop the column `business_hours` on the `places` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `places` table. All the data in the column will be lost.
  - You are about to drop the column `schedulesId` on the `places` table. All the data in the column will be lost.
  - You are about to alter the column `place_id` on the `schedule_places` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- DropForeignKey
ALTER TABLE `places` DROP FOREIGN KEY `places_schedulesId_fkey`;

-- DropForeignKey
ALTER TABLE `schedule_places` DROP FOREIGN KEY `schedule_place_id`;

-- AlterTable
ALTER TABLE `places` DROP COLUMN `business_hours`,
    DROP COLUMN `description`,
    DROP COLUMN `schedulesId`,
    ADD COLUMN `geometry` JSON NOT NULL,
    ADD COLUMN `location` VARCHAR(255) NULL DEFAULT 'Unknown',
    ADD COLUMN `opening_hours` JSON NOT NULL,
    ADD COLUMN `photos` JSON NOT NULL,
    ADD COLUMN `photos_length` INTEGER NULL DEFAULT 0,
    ADD COLUMN `summary` VARCHAR(255) NULL,
    MODIFY `phone` VARCHAR(191) NULL,
    MODIFY `google_map_url` VARCHAR(511) NULL;

-- AlterTable
ALTER TABLE `schedule_places` MODIFY `place_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `schedule_places` ADD CONSTRAINT `schedule_place_id` FOREIGN KEY (`place_id`) REFERENCES `places`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
