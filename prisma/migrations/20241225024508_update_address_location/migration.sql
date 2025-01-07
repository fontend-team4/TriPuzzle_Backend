/*
  Warnings:

  - You are about to drop the column `address` on the `places` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `places` DROP COLUMN `address`,
    ADD COLUMN `location` VARCHAR(255) NULL DEFAULT 'Unknown';
