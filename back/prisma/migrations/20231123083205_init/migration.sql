/*
  Warnings:

  - You are about to drop the column `dealAmount` on the `coin` table. All the data in the column will be lost.
  - You are about to alter the column `unit_amount` on the `coin` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to drop the column `sns_id` on the `sns_login` table. All the data in the column will be lost.
  - You are about to drop the column `sns_profile` on the `sns_login` table. All the data in the column will be lost.
  - You are about to alter the column `krw_amount` on the `wallet` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - The `expiration_datetime` column on the `wallet` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `delivery_detail` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[id]` on the table `address` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `sns_login` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sns_email]` on the table `sns_login` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `wallet` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sns_email` to the `sns_login` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `delivery_detail` DROP FOREIGN KEY `delivery_detail_deal_id_fkey`;

-- DropIndex
DROP INDEX `address_is_default_key` ON `address`;

-- AlterTable
ALTER TABLE `coin` DROP COLUMN `dealAmount`,
    MODIFY `unit_amount` FLOAT NOT NULL;

-- AlterTable
ALTER TABLE `sns_login` DROP COLUMN `sns_id`,
    DROP COLUMN `sns_profile`,
    ADD COLUMN `sns_email` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `wallet` MODIFY `krw_amount` DOUBLE NOT NULL,
    DROP COLUMN `expiration_datetime`,
    ADD COLUMN `expiration_datetime` DATETIME(0) NOT NULL DEFAULT '9999-12-31 23:59:59';

-- DropTable
DROP TABLE `delivery_detail`;

-- CreateTable
CREATE TABLE `delivery` (
    `id` VARCHAR(191) NOT NULL,
    `deal_id` VARCHAR(191) NOT NULL,
    `res_name` VARCHAR(191) NOT NULL,
    `res_address1` VARCHAR(191) NOT NULL,
    `res_address2` VARCHAR(191) NOT NULL,
    `res_status` ENUM('waiting', 'delivery', 'completion') NOT NULL,
    `company` VARCHAR(191) NULL,
    `delivery_number` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `delivery_deal_id_key`(`deal_id`),
    INDEX `delivery_deal_id_fkey`(`deal_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `id_UNIQUE` ON `address`(`id`);

-- CreateIndex
CREATE UNIQUE INDEX `sns_login_user_id_key` ON `sns_login`(`user_id`);

-- CreateIndex
CREATE UNIQUE INDEX `sns_login_sns_email_key` ON `sns_login`(`sns_email`);

-- CreateIndex
CREATE UNIQUE INDEX `id_UNIQUE` ON `wallet`(`id`);

-- AddForeignKey
ALTER TABLE `delivery` ADD CONSTRAINT `delivery_deal_id_fkey` FOREIGN KEY (`deal_id`) REFERENCES `deal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
