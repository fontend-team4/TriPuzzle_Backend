-- AlterTable
ALTER TABLE `places` ADD COLUMN `schedulesId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `places` ADD CONSTRAINT `places_schedulesId_fkey` FOREIGN KEY (`schedulesId`) REFERENCES `schedules`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
