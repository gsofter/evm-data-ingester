import { Redis } from "ioredis";
import { EthereumDataIngester } from "./controllers/ethereum-data-ingestor";

// Parse command line arguments
const args = process.argv.slice(2);
const fromBlock = parseInt(args[0]);
const toBlock = parseInt(args[1]);

// Check if fromBlock and toBlock are valid numbers
if (
  isNaN(fromBlock) ||
  isNaN(toBlock) ||
  fromBlock > toBlock ||
  fromBlock < 0
) {
  console.error(
    "Invalid block numbers. Please provide valid block numbers for <from> and <to>."
  );
  process.exit(1);
}

console.log(`Fetching data for blocks from ${fromBlock} to ${toBlock}`);

const providerUrl = process.env.RPC_PROVIDER_URL || "https://eth.llamarpc.com";
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

// Create an instance of EthereumDataIngester class
const dataIngester = new EthereumDataIngester(providerUrl, redisUrl);

const sub = new Redis(redisUrl);
sub.subscribe(
  "transaction",
  "block",
  "log",
  "internal-transaction",
  (err, count) => {
    if (err) {
      console.error("Failed to subscribe: %s", err.message);
    } else {
      console.log(
        `Subscribed successfully! This client is currently subscribed to ${count} channels.`
      );
    }
  }
);

sub.on("message", (channel, message) => {
  if (channel === "block") {
    const block = JSON.parse(message);
    dataIngester.storeTransaction(block);
  }

  if (channel === "transaction") {
    const tx = JSON.parse(message);
    dataIngester.storeTransaction(tx);
  }

  if (channel === "log") {
    const log = JSON.parse(message);
    dataIngester.storeLog(log);
  }

  if (channel === "internal-transaction") {
    const log = JSON.parse(message);
    dataIngester.fetchAndStoreInternalTransactions(log);
  }
});

sub.on("error", function (error) {
  console.dir(error);
});

// Fetch and process data for each block within the specified range
for (let blockNumber = fromBlock; blockNumber <= toBlock; blockNumber++) {
  dataIngester
    .startFetchingBlockData(blockNumber)
    .catch((error) =>
      console.error(
        `Error fetching and storing data for block ${blockNumber}:`,
        error
      )
    );
}

// Disconnect from database and Redis after processing
process.on("exit", async () => {
  await dataIngester.disconnectDB();
  await dataIngester.disconnectRedis();
});
