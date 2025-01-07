/*
  Warnings:

  - You are about to drop the column `description` on the `places` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `places` DROP COLUMN `description`,
    ADD COLUMN `address` VARCHAR(255) NULL DEFAULT 'Unknown',
    ADD COLUMN `geometry` JSON NOT NULL,
    ADD COLUMN `summary` VARCHAR(255) NULL;
