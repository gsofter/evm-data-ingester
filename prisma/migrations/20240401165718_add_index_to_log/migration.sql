/*
  Warnings:

  - A unique constraint covering the columns `[transactionHash,logIndex]` on the table `Log` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "InternalTransaction_transactionHash_idx" ON "InternalTransaction"("transactionHash");

-- CreateIndex
CREATE INDEX "Log_transactionHash_logIndex_idx" ON "Log"("transactionHash", "logIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Log_transactionHash_logIndex_key" ON "Log"("transactionHash", "logIndex");
