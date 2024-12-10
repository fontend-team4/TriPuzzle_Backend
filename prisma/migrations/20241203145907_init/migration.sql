/*
  Warnings:

  - You are about to alter the column `create_by` on the `schedules` table. The data in that column could be lost. The data in that column will be cast from `VarChar(45)` to `Int`.

*/
-- AlterTable
ALTER TABLE `schedules` MODIFY `create_by` INTEGER NOT NULL;
