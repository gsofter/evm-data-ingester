/*
  Warnings:

  - You are about to drop the column `transactionIndex` on the `Transaction` table. All the data in the column will be lost.
  - Changed the type of `nonce` on the `Transaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "transactionIndex",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "nonce",
ADD COLUMN     "nonce" INTEGER NOT NULL;
