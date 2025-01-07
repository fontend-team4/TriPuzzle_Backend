/*
  Warnings:

  - You are about to drop the column `opening_hours` on the `places` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `places` DROP COLUMN `opening_hours`,
    ADD COLUMN `business_hours` JSON NOT NULL;
