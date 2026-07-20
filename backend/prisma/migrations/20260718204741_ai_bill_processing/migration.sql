/*
  Warnings:

  - You are about to alter the column `status` on the `utilitybill` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.
  - Made the column `billFileUrl` on table `utilitybill` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `utilitybill` MODIFY `utilityType` VARCHAR(191) NULL,
    MODIFY `billMonth` VARCHAR(191) NULL,
    MODIFY `billYear` INTEGER NULL,
    MODIFY `amount` DOUBLE NULL,
    MODIFY `units` DOUBLE NULL,
    MODIFY `billFileUrl` VARCHAR(191) NOT NULL,
    MODIFY `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING';
