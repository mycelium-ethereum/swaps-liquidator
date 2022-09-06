import { Provider } from "@ethersproject/providers";
import PositionService, { IPositionService } from "./../services/position.service";
import ParameterService, { IParameterService } from "./../services/parameter.service";
import { Vault } from "@mycelium-ethereum/perpetual-swaps-contracts";
import { lastSyncedBlock } from "../utils/prometheus";
import { retry } from "./helpers";

const getOpenPositions = async (vault: Vault, provider: Provider) => {
    const eventFilterIncrease = vault.filters.IncreasePosition();
    const eventFilterDecrease = vault.filters.DecreasePosition();
    const eventFilterLiquidate = vault.filters.LiquidatePosition();

    const maxProcessBlock = Number(process.env.MAX_PROCESS_BLOCK);

    const positionService: IPositionService = new PositionService();
    const parameterService: IParameterService = new ParameterService();

    let fromBlock = Number(process.env.FROM_BLOCK);

    const processedLastBlock = await parameterService.getParameter("PROCESSED_LAST_BLOCK");

    if (processedLastBlock) {
        fromBlock = Number(processedLastBlock.value);
        console.log("processedLastBlock =" + processedLastBlock.value);
    } else {
        parameterService.createNewParameter("PROCESSED_LAST_BLOCK", fromBlock.toString());
    }

    console.log("fromBlock =" + fromBlock);

    let lastBlock = await provider.getBlock("latest");

    console.log("lastBlock =" + lastBlock.number);

    let toBlock = fromBlock;

    while (fromBlock < lastBlock.number) {
        toBlock = fromBlock + maxProcessBlock > lastBlock.number ? lastBlock.number : fromBlock + maxProcessBlock;
        console.log("Syncing blocks ::" + fromBlock + "-" + toBlock);

        // All position updates will trigger one of the following events:
        const eventsIncrease = await vault.queryFilter(eventFilterIncrease, fromBlock, toBlock);
        const eventsDecrease = await vault.queryFilter(eventFilterDecrease, fromBlock, toBlock);
        const eventsLiquidate = await vault.queryFilter(eventFilterLiquidate, fromBlock, toBlock);

        const allEvents = [...eventsIncrease, ...eventsDecrease, ...eventsLiquidate];
        const orderedEvents = allEvents.sort((a, b) => {
            if (a.blockNumber === b.blockNumber) {
                return a.transactionIndex - b.transactionIndex;
            }
            return a.blockNumber - b.blockNumber;
        });

        for (const event of orderedEvents) {
            const { key, collateralToken, indexToken, account, isLong } = event.args;
            const [size, collateralAmount, averagePrice, entryFundingRate] = await getVaultPosition(vault, key);
            if (size.eq(0)) {
                await positionService.deletePosition(key, event.blockNumber);
            } else {
                await positionService.upsertPosition({
                    key,
                    collateralToken,
                    indexToken,
                    account,
                    isLong,
                    size: size.toString(),
                    collateralAmount: collateralAmount.toString(),
                    averagePrice: averagePrice.toString(),
                    entryFundingRate: entryFundingRate.toString(),
                    blockNumber: event.blockNumber,
                });
            }
        }

        await parameterService.updateParameter("PROCESSED_LAST_BLOCK", toBlock.toString());
        lastSyncedBlock.set(toBlock);

        fromBlock = toBlock + 1;
        if (lastBlock.number - toBlock < maxProcessBlock) lastBlock = await provider.getBlock("latest");
    }

    const openPositions = await positionService.getPositions();

    return openPositions;
};

export default getOpenPositions;

async function getVaultPosition(vault: Vault, key: string) {
    return retry({
        fn: async () => {
            const position = await vault.positions(key);
            return position;
        },
        shouldRetry: (err) => true,
        maxRetries: 10,
        timeoutSeconds: 5,
    });
}