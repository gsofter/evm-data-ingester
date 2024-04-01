-- CreateTable
CREATE TABLE "InternalTransaction" (
    "id" SERIAL NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "blockHash" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "gas" TEXT NOT NULL,
    "gasUsed" TEXT NOT NULL,
    "timestamp" INTEGER NOT NULL,

    CONSTRAINT "InternalTransaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InternalTransaction" ADD CONSTRAINT "InternalTransaction_transactionHash_fkey" FOREIGN KEY ("transactionHash") REFERENCES "Transaction"("hash") ON DELETE RESTRICT ON UPDATE CASCADE;
