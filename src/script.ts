import { Redis } from "ioredis";
import { EthereumDataIngester } from "./controllers/ethereum-data-ingestor";
// Specify Ethereum provider URL and PostgreSQL database URL
const providerUrl = process.env.RPC_PROVIDER_URL || "https://eth.llamarpc.com";
const redisUrl = "redis://localhost:6379";

// Create an instance of EthereumDataIngester class
const dataIngester = new EthereumDataIngester(providerUrl, redisUrl);

console.log("redisUrl => ", redisUrl);
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

// Random block number for trial purpose
const blockNumber = 19562371;

dataIngester
  .startFetchingBlockData(blockNumber)
  .catch((error) => console.error("Error fetching and storing data:", error))
  .finally(async () => {
    // sub.disconnect();
    // dataIngester.disconnectDB();
    // dataIngester.disconnectRedis();

    console.log("Done");
  });
