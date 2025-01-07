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
    `favorite_places` VARCHAR(191) NOT NULL,
    `id` INTEGER NOT NULL AUTO_INCREMENT,

    INDEX `favorites_place_id_idx`(`favorite_places`),
    INDEX `favorites_user_id_idx`(`favorite_user`),
    UNIQUE INDEX `favorites_favorite_user_favorite_places_key`(`favorite_user`, `favorite_places`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `places` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `name_en` VARCHAR(255) NULL,
    `image_url` VARCHAR(2048) NULL,
    `country` VARCHAR(45) NULL DEFAULT 'Unknown',
    `city` VARCHAR(45) NULL DEFAULT 'Unknown',
    `address` VARCHAR(255) NULL DEFAULT 'Unknown',
    `phone` VARCHAR(191) NULL,
    `website` VARCHAR(225) NULL,
    `rating` DECIMAL(2, 1) NULL DEFAULT 0.0,
    `google_map_url` VARCHAR(511) NULL,
    `web_map` VARCHAR(255) NULL,
    `share_url` VARCHAR(255) NULL,
    `share_code` BLOB NULL,
    `search_code` VARCHAR(255) NULL,
    `place_id` VARCHAR(255) NOT NULL,
    `geometry` JSON NOT NULL,
    `location` VARCHAR(255) NULL DEFAULT 'Unknown',
    `opening_hours` JSON NOT NULL,
    `photos` JSON NOT NULL,
    `photos_length` INTEGER NULL DEFAULT 0,
    `summary` VARCHAR(255) NULL,
    `token` VARCHAR(191) NULL,

    UNIQUE INDEX `places_place_id_key`(`place_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `places_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `place_id` VARCHAR(191) NOT NULL,
    `category_id` INTEGER NOT NULL,

    INDEX `categories_category_id_idx`(`category_id`),
    INDEX `categories_places_id_idx`(`place_id`),
    UNIQUE INDEX `places_categories_place_id_category_id_key`(`place_id`, `category_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedule_places` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `place_id` VARCHAR(191) NOT NULL,
    `schedule_id` INTEGER NOT NULL,
    `which_date` DATE NOT NULL,
    `arrival_time` TIME(0) NULL DEFAULT '08:00:00',
    `stay_time` TIME(0) NULL DEFAULT '01:00:00',
    `transportation_way` ENUM('PUBLIC_TRANSPORT', 'WALK', 'CAR', 'MOTORBIKE', 'CUSTOM') NOT NULL DEFAULT 'PUBLIC_TRANSPORT',
    `order` INTEGER NOT NULL DEFAULT 0,

    INDEX `schedule_place_id_idx`(`place_id`),
    INDEX `schedule_schedule_id_idx`(`schedule_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(45) NOT NULL,
    `create_by` INTEGER NOT NULL,
    `co_edit_url` VARCHAR(225) NULL,
    `co_edit_qrcode` BLOB NULL,
    `schedule_note` TEXT NULL,
    `image_url` VARCHAR(255) NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `transportation_way` ENUM('PUBLIC_TRANSPORT', 'WALK', 'CAR', 'MOTORBIKE', 'CUSTOM') NOT NULL DEFAULT 'PUBLIC_TRANSPORT',
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `share_token` VARCHAR(225) NULL,
    `total_users` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `schedules_share_token_key`(`share_token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(45) NOT NULL,
    `email` VARCHAR(45) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `profile_pic_url` VARCHAR(255) NULL,
    `phone` VARCHAR(191) NULL,
    `gender` ENUM('Male', 'Female', 'Other') NULL,
    `birthday` DATE NULL,
    `description` VARCHAR(225) NULL,
    `login_way` VARCHAR(45) NULL,
    `create_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `token` VARCHAR(511) NULL,
    `token_time` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `level` VARCHAR(45) NULL,

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

    INDEX `users_schedules_schedule_id_idx`(`schedule_id`),
    INDEX `users_schedules_user_id_idx`(`user_id`),
    PRIMARY KEY (`schedule_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tokenblacklist` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `tokenBlacklist_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_favorite_places_fkey` FOREIGN KEY (`favorite_places`) REFERENCES `places`(`place_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_favorite_user_fkey` FOREIGN KEY (`favorite_user`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `places_categories` ADD CONSTRAINT `places_categories_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `places_categories` ADD CONSTRAINT `places_categories_place_id_fkey` FOREIGN KEY (`place_id`) REFERENCES `places`(`place_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_places` ADD CONSTRAINT `schedule_place_id` FOREIGN KEY (`place_id`) REFERENCES `places`(`place_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `schedule_places` ADD CONSTRAINT `schedule_schedule_id` FOREIGN KEY (`schedule_id`) REFERENCES `schedules`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

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
ALTER TABLE `users_schedules` ADD CONSTRAINT `users_schedules_schedule_id_fkey` FOREIGN KEY (`schedule_id`) REFERENCES `schedules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users_schedules` ADD CONSTRAINT `users_schedules_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
