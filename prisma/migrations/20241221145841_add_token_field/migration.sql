/*
  Warnings:

  - The primary key for the `favorites` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[favorite_user,favorite_places]` on the table `favorites` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[place_id]` on the table `places` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[place_id,category_id]` on the table `places_categories` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id` to the `favorites` table without a default value. This is not possible if the table is not empty.
  - Added the required column `place_id` to the `places` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `favorites` DROP FOREIGN KEY `favorites_place_id`;

-- DropForeignKey
ALTER TABLE `favorites` DROP FOREIGN KEY `favorites_user_id`;

-- DropForeignKey
ALTER TABLE `places_categories` DROP FOREIGN KEY `categories_category_id`;

-- DropForeignKey
ALTER TABLE `places_categories` DROP FOREIGN KEY `categories_place_id`;

-- DropForeignKey
ALTER TABLE `schedule_places` DROP FOREIGN KEY `schedule_place_id`;

-- AlterTable
ALTER TABLE `favorites` DROP PRIMARY KEY,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `favorite_places` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `places` ADD COLUMN `place_id` VARCHAR(255) NOT NULL,
    ADD COLUMN `token` VARCHAR(191) NULL,
    MODIFY `country` VARCHAR(45) NULL DEFAULT 'Unknown',
    MODIFY `city` VARCHAR(45) NULL DEFAULT 'Unknown',
    MODIFY `address` VARCHAR(255) NULL DEFAULT 'Unknown';

-- AlterTable
ALTER TABLE `places_categories` MODIFY `place_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `schedule_places` MODIFY `place_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `schedules` ADD COLUMN `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `users` ADD COLUMN `token` VARCHAR(191) NULL,
    ADD COLUMN `token_time` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- CreateTable
CREATE TABLE `tokenblacklist` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `tokenBlacklist_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `favorites_favorite_user_favorite_places_key` ON `favorites`(`favorite_user`, `favorite_places`);

-- CreateIndex
CREATE UNIQUE INDEX `places_place_id_key` ON `places`(`place_id`);

-- CreateIndex
CREATE UNIQUE INDEX `places_categories_place_id_category_id_key` ON `places_categories`(`place_id`, `category_id`);

-- AddForeignKey
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_favorite_places_fkey` FOREIGN KEY (`favorite_places`) REFERENCES `places`(`place_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_favorite_user_fkey` FOREIGN KEY (`favorite_user`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `places_categories` ADD CONSTRAINT `places_categories_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `places_categories` ADD CONSTRAINT `places_categories_place_id_fkey` FOREIGN KEY (`place_id`) REFERENCES `places`(`place_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_places` ADD CONSTRAINT `schedule_place_id` FOREIGN KEY (`place_id`) REFERENCES `places`(`place_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
