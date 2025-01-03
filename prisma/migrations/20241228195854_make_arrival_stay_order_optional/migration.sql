-- AlterTable
ALTER TABLE `schedule_places` MODIFY `stay_time` TIME(0) NULL DEFAULT '01:00:00',
    MODIFY `order` VARCHAR(45) NULL;
