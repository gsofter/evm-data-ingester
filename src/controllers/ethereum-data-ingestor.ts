import { ethers } from "ethers";
import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";
import axios from "axios";

export interface IBlock {
  number: number;
  hash: string;
  parentHash: string;
  timestamp: number;
  nonce?: string;
  difficulty: number;
  gasLimit: string;
  gasUsed: string;
  miner: string;
  extraData: string;
  baseFeePerGas?: null | string;
}

export interface ITransaction {
  hash: string;
  to?: string;
  from: string;
  nonce: number;
  gas: string;
  gasPrice?: string;
  data: string;
  value: string;
  blockNumber: number;
  blockHash: string;
  timestamp?: number;
  confirmations: number;
}

export class EthereumDataIngester {
  private provider: ethers.providers.JsonRpcProvider;
  private prisma: PrismaClient;
  private redis: Redis;

  constructor(providerUrl: string, redisUrl: string) {
    this.provider = new ethers.providers.JsonRpcProvider(providerUrl);
    this.prisma = new PrismaClient();
    this.redis = new Redis(redisUrl);
  }

  async publishToRedis(channelName: string, messageData: any): Promise<void> {
    await this.redis.publish(channelName, JSON.stringify(messageData));
  }

  async fetchTransactions(blockNumber: number): Promise<void> {
    try {
      const block = await this.provider.getBlockWithTransactions(blockNumber);
      console.log(`Fetch block for ${blockNumber}`);
      console.log({ block });

      const { transactions, ...blockData } = block;
      const blockMessageData: IBlock = {
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
      };

      await this.storeBlock(blockMessageData);

      for (const tx of block.transactions) {
        const txMessageData: ITransaction = {
          hash: tx.hash,
          blockNumber: tx.blockNumber || 0,
          blockHash: tx.blockHash || "",
          nonce: tx.nonce,
          from: tx.from,
          to: tx.to,
          value: tx.value.toString(),
          gas: tx.gasLimit.toString(),
          gasPrice: tx.gasPrice?.toString(),
          data: tx.data,
          confirmations: tx.confirmations,
        };

        this.publishToRedis("transaction", txMessageData);

        console.log(`Tx for ${tx.hash} queued.`);
      }
      console.log(`Transactions for block ${blockNumber} queued successfully.`);
    } catch (error) {
      console.error(
        `Error storing transactions for block ${blockNumber}:`,
        error
      );
    }
  }

  async fetchLogs(blockNumber: number): Promise<void> {
    try {
      const logs = await this.provider.getLogs({
        fromBlock: blockNumber,
        toBlock: blockNumber,
      });

      for (const log of logs) {
        this.publishToRedis("log", log);
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

  async storeBlock(block: IBlock) {
    const { number, ...updates } = block;
    // create new block or update existing one
    await this.prisma.block.upsert({
      where: {
        number: block.number,
      },
      create: {
        number: block.number,
        ...updates,
      },
      update: {
        ...updates,
      },
    });

    console.log(`Block stored for ${block.number}`);
  }

  async storeTransaction(tx: ITransaction) {
    const { hash, ...updates } = tx;
    await this.prisma.transaction.upsert({
      where: {
        hash,
      },
      create: {
        hash,
        ...updates,
      },
      update: {
        ...updates,
      },
    });

    console.log(`Tx stored for ${tx.hash}`);

    this.storeInternalTransaction(tx.hash);
  }

  async storeLog(log: ethers.providers.Log) {
    const logFound = await this.prisma.log.findFirst({
      where: {
        transactionHash: log.transactionHash,
      },
    });

    if (logFound) console.log(`Log for ${log.transactionHash} existing`);

    await this.prisma.log.create({
      data: {
        transactionHash: log.transactionHash,
        logIndex: log.logIndex,
        blockNumber: log.blockNumber,
        blockHash: log.blockHash,
        address: log.address,
        data: log.data,
        topics: log.topics,
        removed: log.removed,
      },
    });

    console.log(`Log stored for ${log.transactionHash}`);
  }

  async storeInternalTransaction(txHash: string): Promise<void> {
    const foundInDB = await this.prisma.internalTransaction.findFirst({
      where: {
        transactionHash: txHash,
      },
    });
    if (foundInDB) {
      // skip to store internal tx
      console.log(`Skipped storing interanl tx for ${txHash}`);
      return;
    }

    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const response = await axios.get(
          `https://api.etherscan.io/api?module=account&action=txlistinternal&txhash=${txHash}&apikey=${process.env.ETHERSCAN_API_KEY}`
        );
        if (response.data.status === "1" && response.data.result) {
          const inTxes = response.data.result;

          const internalTxMap = inTxes.map((inTx: any) => ({
            blockNumber: Number(inTx.blockNumber || "0"),
            from: inTx.from,
            to: inTx.to,
            gas: inTx.gas,
            gasUsed: inTx.gasUsed,
            input: inTx.input,
            timestamp: Number(inTx.timestamp || "0"),
            type: inTx.type,
            value: inTx.value,
            transactionHash: txHash,
          }));

          await this.prisma.internalTransaction.createMany({
            data: internalTxMap,
          });

          console.log(`Internal transactions stored for ${txHash}`);
          return;
        }
      } catch (error: any) {
        if (error.response && error.response.status === 429) {
          // Rate limit exceeded
          const waitTime = 1000; // 1 second wait time
          console.log(
            `Rate limit exceeded. Retrying after ${waitTime} milliseconds...`
          );
          await new Promise((resolve) => setTimeout(resolve, waitTime)); // Wait for waitTime milliseconds
          retries++;
        } else {
          console.error("Error fetching internal transactions:", error);
          // return;
          throw error;
        }
      }
    }
  }

  async startFetchingBlockData(blockNumber: number): Promise<void> {
    await this.fetchTransactions(blockNumber);
    await this.fetchLogs(blockNumber);
  }

  async disconnectDB(): Promise<void> {
    await this.prisma.$disconnect();
  }

  async disconnectRedis(): Promise<void> {
    await this.redis.disconnect();
  }
}
