-- AlterTable
ALTER TABLE `places` MODIFY `city` VARCHAR(45) NULL DEFAULT 'Unknown',
    MODIFY `address` VARCHAR(255) NULL DEFAULT 'Unknown';
