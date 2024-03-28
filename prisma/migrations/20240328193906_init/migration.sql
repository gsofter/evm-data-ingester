-- CreateTable
CREATE TABLE "Block" (
    "number" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "parentHash" TEXT NOT NULL,
    "nonce" TEXT,
    "difficulty" TEXT NOT NULL,
    "gasLimit" INTEGER NOT NULL,
    "gasUsed" INTEGER NOT NULL,
    "miner" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("number")
);

-- CreateIndex
CREATE UNIQUE INDEX "Block_hash_key" ON "Block"("hash");
