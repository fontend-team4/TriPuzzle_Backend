/*
  Warnings:

  - A unique constraint covering the columns `[place_id]` on the table `places` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `place_id` to the `places` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `places` ADD COLUMN `place_id` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `token_time` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- CreateIndex
CREATE UNIQUE INDEX `places_place_id_key` ON `places`(`place_id`);
