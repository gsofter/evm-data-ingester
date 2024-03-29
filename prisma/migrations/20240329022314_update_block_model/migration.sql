/*
  Warnings:

  - Added the required column `extraData` to the `Block` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nonce` to the `Block` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `difficulty` on the `Block` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Block" ADD COLUMN     "extraData" TEXT NOT NULL,
DROP COLUMN "nonce",
ADD COLUMN     "nonce" INTEGER NOT NULL,
DROP COLUMN "difficulty",
ADD COLUMN     "difficulty" INTEGER NOT NULL;
