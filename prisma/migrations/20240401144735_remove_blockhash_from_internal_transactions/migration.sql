/*
  Warnings:

  - You are about to drop the column `blockHash` on the `InternalTransaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "InternalTransaction" DROP COLUMN "blockHash";
