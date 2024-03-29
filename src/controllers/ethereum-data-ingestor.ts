import { ethers } from "ethers";
import { PrismaClient } from "@prisma/client";

export class EthereumDataIngester {
  private provider: ethers.providers.JsonRpcProvider;
  private prisma: PrismaClient;

  constructor(providerUrl: string) {
    this.provider = new ethers.providers.JsonRpcProvider(providerUrl);
    this.prisma = new PrismaClient();
  }

  async fetchAndStoreTransactions(blockNumber: number): Promise<void> {
    try {
      const block = await this.provider.getBlockWithTransactions(blockNumber);
      console.log(`Storing transactions for block ${blockNumber}`);
      console.log({ block });

      // create new block
      await this.prisma.block.upsert({
        where: {
          number: block.number,
        },
        create: {
          number: block.number,
          hash: block.hash,
          parentHash: block.parentHash,
          nonce: block.nonce,
          difficulty: block.difficulty,
          gasLimit: block.gasLimit.toString(),
          gasUsed: block.gasUsed.toString(),
          miner: block.miner,
          timestamp: block.timestamp,
          extraData: block.extraData,
        },
        update: {
          number: block.number,
          hash: block.hash,
          parentHash: block.parentHash,
          nonce: block.nonce,
          difficulty: block.difficulty,
          gasLimit: block.gasLimit.toString(),
          gasUsed: block.gasUsed.toString(),
          miner: block.miner,
          timestamp: block.timestamp,
          extraData: block.extraData,
        },
      });

      for (const tx of block.transactions) {
        await this.prisma.transaction.upsert({
          where: {
            hash: tx.hash,
          },
          create: {
            hash: tx.hash,
            blockNumber: blockNumber,
            blockHash: block.hash,
            nonce: tx.nonce,
            from: tx.from,
            to: tx.to,
            value: tx.value.toString(),
            gas: tx.gasLimit.toString(),
            gasPrice: tx.gasPrice?.toString(),
            input: tx.data,
          },
          update: {
            blockNumber: blockNumber,
            blockHash: block.hash,
            nonce: tx.nonce,
            from: tx.from,
            to: tx.to,
            value: tx.value.toString(),
            gas: tx.gasLimit.toString(),
            gasPrice: tx.gasPrice?.toString(),
            input: tx.data,
          },
        });
      }
      console.log(`Transactions for block ${blockNumber} stored successfully.`);
    } catch (error) {
      console.error(
        `Error storing transactions for block ${blockNumber}:`,
        error
      );
    }
  }

  async fetchAndStoreInternalTransactions(blockNumber: number): Promise<void> {
    try {
      const logs = await this.provider.getLogs({
        fromBlock: blockNumber,
        toBlock: blockNumber,
      });
      console.log(`Storing internal transactions for block ${blockNumber}`);
      for (const log of logs) {
        await this.prisma.log.create({
          data: {
            transactionHash: log.transactionHash,
            logIndex: log.logIndex,
            blockNumber: blockNumber,
            blockHash: log.blockHash,
            address: log.address,
            data: log.data,
            topics: log.topics,
            removed: log.removed,
          },
        });
      }
      console.log(
        `Internal transactions for block ${blockNumber} stored successfully.`
      );
    } catch (error) {
      console.error(
        `Error storing internal transactions for block ${blockNumber}:`,
        error
      );
    }
  }

  async fetchAndStoreBlockData(blockNumber: number): Promise<void> {
    await this.fetchAndStoreTransactions(blockNumber);
    await this.fetchAndStoreInternalTransactions(blockNumber);
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
