-- CreateTable
CREATE TABLE `bills` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATE NOT NULL,
    `title` VARCHAR(45) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `create_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `category` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `favorites` (
    `favorite_user` INTEGER NOT NULL,
    `favorite_places` INTEGER NOT NULL,

    INDEX `favorites_place_id_idx`(`favorite_places`),
    INDEX `favorites_user_id_idx`(`favorite_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `places` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `name_en` VARCHAR(255) NULL,
    `description` VARCHAR(255) NULL,
    `image_url` VARCHAR(255) NOT NULL,
    `country` VARCHAR(45) NOT NULL,
    `city` VARCHAR(45) NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `phone` INTEGER NULL,
    `website` VARCHAR(225) NULL,
    `rating` DECIMAL(2, 1) NULL DEFAULT 0.0,
    `business_hours` VARCHAR(255) NULL,
    `google_map_url` VARCHAR(255) NULL,
    `web_map` VARCHAR(255) NULL,
    `share_url` VARCHAR(255) NULL,
    `share_code` BLOB NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `places_categories` (
    `place_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,

    INDEX `categories_category_id_idx`(`category_id`),
    INDEX `categories_places_id_idx`(`place_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedule_places` (
    `place_id` INTEGER NOT NULL,
    `schedule_id` INTEGER NOT NULL,
    `which_date` DATE NOT NULL,
    `arrival_time` TIME(0) NULL DEFAULT '08:00:00',
    `stay_time` TIME(0) NOT NULL DEFAULT '01:00:00',
    `transportation_way` VARCHAR(45) NULL,
    `order` VARCHAR(45) NOT NULL,

    UNIQUE INDEX `order_UNIQUE`(`order`),
    INDEX `schedule_place_id_idx`(`place_id`),
    INDEX `schedule_schedule_id_idx`(`schedule_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(45) NOT NULL,
    `create_by` VARCHAR(45) NOT NULL,
    `co_edit_url` VARCHAR(225) NULL,
    `co_edit_qrcode` BLOB NULL,
    `schedule_note` TEXT NULL,
    `image_url` VARCHAR(255) NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(45) NOT NULL,
    `email` VARCHAR(45) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `profile_pic_url` VARCHAR(255) NULL,
    `phone` INTEGER NULL,
    `gender` ENUM('Male', 'Female', 'Other') NULL,
    `birthday` DATE NULL,
    `description` VARCHAR(225) NULL,
    `login_way` VARCHAR(45) NULL,
    `create_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `email_UNIQUE`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users_bills` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `schedule_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `bill_id` INTEGER NOT NULL,
    `pay_first` BOOLEAN NOT NULL,
    `share` BOOLEAN NULL,

    INDEX `fk_bill_id_idx`(`bill_id`),
    INDEX `fk_schedule_id_idx`(`schedule_id`),
    INDEX `user_bill_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `users_id` INTEGER NOT NULL,
    `schedule_id` INTEGER NOT NULL,
    `schedule_image_url` VARCHAR(255) NOT NULL,

    INDEX `image_schedule_idx`(`schedule_id`),
    INDEX `image_user_id_idx`(`users_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users_schedules` (
    `schedule_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `access` BOOLEAN NOT NULL DEFAULT true,

    INDEX `fk_schedules_id_idx`(`schedule_id`),
    INDEX `fk_user_id_idx`(`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_place_id` FOREIGN KEY (`favorite_places`) REFERENCES `places`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_user_id` FOREIGN KEY (`favorite_user`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `places_categories` ADD CONSTRAINT `categories_category_id` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `places_categories` ADD CONSTRAINT `categories_place_id` FOREIGN KEY (`place_id`) REFERENCES `places`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `schedule_places` ADD CONSTRAINT `schedule_place_id` FOREIGN KEY (`place_id`) REFERENCES `places`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `schedule_places` ADD CONSTRAINT `schedule_schedule_id` FOREIGN KEY (`schedule_id`) REFERENCES `schedules`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `users_bills` ADD CONSTRAINT `bills_bill_id` FOREIGN KEY (`bill_id`) REFERENCES `bills`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `users_bills` ADD CONSTRAINT `bills_schedule_id` FOREIGN KEY (`schedule_id`) REFERENCES `schedules`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `users_bills` ADD CONSTRAINT `bills_user_id` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `users_images` ADD CONSTRAINT `image_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `schedules`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `users_images` ADD CONSTRAINT `image_user_id` FOREIGN KEY (`users_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `users_schedules` ADD CONSTRAINT `schedules_schedule_id` FOREIGN KEY (`schedule_id`) REFERENCES `schedules`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `users_schedules` ADD CONSTRAINT `schedules_user_id` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
