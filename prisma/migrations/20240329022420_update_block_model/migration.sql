-- AlterTable
ALTER TABLE "Block" ALTER COLUMN "nonce" DROP NOT NULL,
ALTER COLUMN "nonce" SET DATA TYPE TEXT;