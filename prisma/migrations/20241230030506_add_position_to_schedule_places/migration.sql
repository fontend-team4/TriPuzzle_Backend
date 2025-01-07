/*
  Warnings:

  - You are about to drop the column `position` on the `schedule_places` table. All the data in the column will be lost.
  - Made the column `order` on table `schedule_places` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `order_UNIQUE` ON `schedule_places`;

-- AlterTable
ALTER TABLE `schedule_places` DROP COLUMN `position`,
    MODIFY `order` INTEGER NOT NULL DEFAULT 0;
