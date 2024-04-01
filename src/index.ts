import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
const PORT = 3000;

app.use(express.json());

// GET /logs endpoint to query logs
app.get("/logs", async (req: Request, res: Response) => {
  try {
    // Extract filter parameters from query string
    const { fromBlock, toBlock, address, topics } = req.query;

    // Prepare filter object based on query parameters
    const filter: any = {};
    if (fromBlock) filter.blockNumber = { gte: parseInt(fromBlock as string) };
    if (toBlock)
      filter.blockNumber = {
        ...filter.blockNumber,
        lte: parseInt(toBlock as string),
      };
    if (address) filter.address = address;
    if (topics)
      filter.topics = {
        has: topics,
      };

    const logs = await prisma.log.findMany({
      where: filter,
    });

    res.json(logs);
  } catch (error) {
    console.error("Error querying logs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
