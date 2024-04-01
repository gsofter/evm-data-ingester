# Ethereum Data Ingester and API Development

## Overview

The Ethereum Data Ingester and API Development project aims to develop a system for ingesting historical data from the Ethereum blockchain and exposing it through a RESTful API. The system consists of multiple components including a data ingester, PostgreSQL database for storage, Redis for message queuing, and a Node.js server for hosting the API endpoints.

## Technical Stacks

- **Ethers.js and TypeScript**: Used for connecting to the Ethereum blockchain, fetching transactions, and internal transactions.
- **Prisma**: Database ORM for PostgreSQL, providing a convenient way to interact with the database.
- **Redis**: Used as a message queue service to implement the pub-sub model for asynchronous processing.
- **Express.js**: Framework for building the RESTful API.
- **Docker**: Used for containerization to simplify deployment and manage dependencies.

## Running the Project Locally

To run the project locally, follow these steps:

1. Clone the repository: `git clone git@github.com:gsofter/evm-data-ingester.git`
2. Navigate to the project directory: `cd ethereum-data-ingester`
3. Create a `.env` file in the root directory and set the necessary environment variables.

Example:

```
DATABASE_URL=<your-postgres-db-url>
RPC_PROVIDER_URL=<eth-rpc-provider-url>
REDIS_URL=<your-redis-url>
ETHERSCAN_API_KEY=<your-etherscan-api-key>
```

4. Run `docker-compose up -d` to start the Redis and PostgreSQL services.
5. Run `npx prisma migrate dev` to run migrations for the PostgreSQL database. 
6. Finally, run `npm run dev` to start the Node.js API server

## How to start injesting data from evm

```
npx ts-node src/injest.ts <from_block> <to_block>

```

## How to test endpoint to get logs

### /logs

The `/logs` endpoint allows you to query logs from the Ethereum blockchain. It supports filter parameters similar to the JSON-RPC `getLogs` method.

To test the `/logs` endpoint:

1. Make a GET request to the `/logs` endpoint with the desired query parameters.
2. Example query parameters include:

- `fromBlock`: Specify the starting block number.
- `toBlock`: Specify the ending block number.
- `address`: Specify the address of the contract.
- `topics`: Specify log topics.



3. Example request:

`<API_HOST>/logs?address=0x0Df581a7afC09d0A0a55BF864baEf2A4559Bbfe2&topics=0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef&fromBlock=19562372`

