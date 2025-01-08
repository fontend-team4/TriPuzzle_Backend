/*
  Warnings:

  - Added the required column `created_by` to the `bills` table without a default value. This is not possible if the table is not empty.
  - Added the required column `split_among` to the `bills` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `bills` ADD COLUMN `created_by` INTEGER NOT NULL,
    ADD COLUMN `is_personal` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `remarks` VARCHAR(255) NULL,
    ADD COLUMN `split_among` JSON NOT NULL;
