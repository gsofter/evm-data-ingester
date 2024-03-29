import { EthereumDataIngester } from "./controllers/ethereum-data-ingestor";
// Specify Ethereum provider URL and PostgreSQL database URL
const providerUrl = "https://eth.llamarpc.com";

// Create an instance of EthereumDataIngester class
const dataIngester = new EthereumDataIngester(providerUrl);

const blockNumber = 19536449;
// Fetch and store data for the specified block

dataIngester
  .fetchAndStoreBlockData(blockNumber)
  .then(() => console.log("Data fetched and stored successfully."))
  .catch((error) => console.error("Error fetching and storing data:", error))
  .finally(async () => {
    // Disconnect Prisma client after use
    await dataIngester.disconnect();
  });
