/*
  Warnings:

  - You are about to drop the column `business_hours` on the `places` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `places` DROP COLUMN `business_hours`,
    ADD COLUMN `opening_hours` JSON NOT NULL;
