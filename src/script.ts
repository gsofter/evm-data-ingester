import { Redis } from "ioredis";
import { EthereumDataIngester } from "./controllers/ethereum-data-ingestor";
// Specify Ethereum provider URL and PostgreSQL database URL
const providerUrl = process.env.RPC_PROVIDER_URL || "https://eth.llamarpc.com	";
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

// Create an instance of EthereumDataIngester class
const dataIngester = new EthereumDataIngester(providerUrl, redisUrl);

const sub = new Redis();
sub.subscribe("transaction", "block", "log", (err, count) => {
  if (err) {
    console.error("Failed to subscribe: %s", err.message);
  } else {
    console.log(
      `Subscribed successfully! This client is currently subscribed to ${count} channels.`
    );
  }
});

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
});

// Random block number for trial purpose
const blockNumber = 19536449;

dataIngester
  .startFetchingBlockData(blockNumber)
  .catch((error) => console.error("Error fetching and storing data:", error))
  .finally(async () => {});
