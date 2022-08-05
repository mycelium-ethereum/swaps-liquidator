# Mycelium Swaps Liquidator

This keeper will automatically liquidate unhealthy positions in the Mycelium Swaps contracts.  It can either be run as a single container, connecting to an external MongoDB database, or the database and keeper can be run together with `docker-compose`.

## Setting up the Environment

To setup the environment, copy the `env.example` file to `.env` and set the variables.

| Variable Name            | Description                                                                                                                                                         |
|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| RPC_URL                  | An url for the JsonHttpProvider to make RPC requests.                                                                                                               |
| FEE_RECEIVER_ADDRESS     | The address to which liquidation fees should be sent                                                                                                                |
| LIQUIDATOR_PRIVATE_KEY   | The private key of the liquidator wallet. This will need to be set in the `PositionManager.sol` contract. This can be checked by calling the `isLiquidator` method. |
| PORT                     | Port which exposes the liquidator                                                                                                                                   |
| FROM_BLOCK               | Block number from which the liquidator should start syncing.   A good choice would be the block number that the `Vault.sol` contract was deployed.                  |
| VAULT_ADDRESS            | Address for the `Vault.sol` contract                                                                                                                                |
| POSITION_MANAGER_ADDRESS | Address for the `PositionManager.sol` contract                                                                                                                      |
| MAX_PROCESS_BLOCK        | The maximum number of blocks to process in a single `provider.getLogs` RPC request. This will be determined by the RPC service.  Alchemy's maximum is 2000.         |
| START_CRON               | The crontab time syntax for how frequently the liquidator should be run                                                                                             |
| DB_USER                  | The username to access the MongoDB database.  If using an external database, ensure this user has "readWrite" permissions.                                          |
| DB_PASSWORD              | The password to access the MongoDB database                                                                                                                         |
| DB_NAME                  | The name of the MongoDB database                                                                                                                                    |
| DB_HOST                  | The hostname for the MongoDB database (This is ignored when using docker-compose)                                                                                   |
| DB_PORT                  | The port for the MongoDB database (This is ignored when using docker-compose)                                                                                       |                                                                                                                                 |

## Running with Docker Compose

Setup the environment, then build and run the docker-compose.

```
docker compose build
docker compose up
```

## Running with External Database

Setup the environment, then build and run the docker container.

```
docker build -t mycelium-swaps-liquidator .
docker run --env-file .env mycelium-swaps-liquidator
```

