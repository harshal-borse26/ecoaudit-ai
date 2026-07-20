-- CreateTable
CREATE TABLE `UtilityBill` (
    `id` VARCHAR(191) NOT NULL,
    `utilityType` VARCHAR(191) NOT NULL,
    `billMonth` VARCHAR(191) NOT NULL,
    `billYear` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `units` DOUBLE NOT NULL,
    `billFileUrl` VARCHAR(191) NULL,
    `facilityId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UtilityBill` ADD CONSTRAINT `UtilityBill_facilityId_fkey` FOREIGN KEY (`facilityId`) REFERENCES `Facility`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
