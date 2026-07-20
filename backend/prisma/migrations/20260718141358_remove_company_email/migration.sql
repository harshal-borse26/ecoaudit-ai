/*
  Warnings:

  - You are about to drop the column `email` on the `company` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Company_email_key` ON `company`;

-- AlterTable
ALTER TABLE `company` DROP COLUMN `email`;

-- AlterTable
ALTER TABLE `user` MODIFY `role` VARCHAR(191) NOT NULL DEFAULT 'ADMIN';
