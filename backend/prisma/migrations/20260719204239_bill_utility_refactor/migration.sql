/*
  Warnings:

  - You are about to drop the column `amount` on the `utilitybill` table. All the data in the column will be lost.
  - You are about to drop the column `carbonEmission` on the `utilitybill` table. All the data in the column will be lost.
  - You are about to drop the column `units` on the `utilitybill` table. All the data in the column will be lost.
  - You are about to drop the column `utilityType` on the `utilitybill` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `utilitybill` DROP COLUMN `amount`,
    DROP COLUMN `carbonEmission`,
    DROP COLUMN `units`,
    DROP COLUMN `utilityType`,
    ADD COLUMN `totalAmount` DOUBLE NULL,
    MODIFY `billFileUrl` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `BillUtility` (
    `id` VARCHAR(191) NOT NULL,
    `utilityType` VARCHAR(191) NOT NULL,
    `usage` DOUBLE NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `carbonEmission` DOUBLE NOT NULL DEFAULT 0,
    `billId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BillUtility` ADD CONSTRAINT `BillUtility_billId_fkey` FOREIGN KEY (`billId`) REFERENCES `UtilityBill`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
