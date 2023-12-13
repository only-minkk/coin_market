/*
  Warnings:

  - You are about to drop the column `stockAmount` on the `coin` table. All the data in the column will be lost.
  - You are about to drop the column `isActivate` on the `deal` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `coin` DROP COLUMN `stockAmount`,
    ADD COLUMN `stock_amount` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `deal` DROP COLUMN `isActivate`,
    ADD COLUMN `is_activate` TINYINT NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX `sns_login_user_id_fkey` ON `sns_login`(`user_id`);
