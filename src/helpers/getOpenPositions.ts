import { Provider } from "@ethersproject/providers";
import PositionService, { IPositionService } from "./../services/position.service";
import ParameterService, { IParameterService } from "./../services/parameter.service";
import { Vault } from "@mycelium-ethereum/perpetual-swaps-contracts";
import { lastSyncedBlock } from "../utils/prometheus";

const getOpenPositions = async (vault: Vault, provider: Provider) => {
    const ipEventFilterIncrease = vault.filters.IncreasePosition();
    const ipEventFilterClose = vault.filters.ClosePosition();
    const ipEventFilterLiquidate = vault.filters.LiquidatePosition();

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

        const eventsIncrease = await vault.queryFilter(ipEventFilterIncrease, fromBlock, toBlock);
        const eventsClose = await vault.queryFilter(ipEventFilterClose, fromBlock, toBlock);
        const eventsLiquidate = await vault.queryFilter(ipEventFilterLiquidate, fromBlock, toBlock);

        console.log("Blocks ->" + fromBlock + "-" + toBlock);

        await Promise.all(
            eventsIncrease.map(async (event) => {
                await positionService
                    .createNewPosition(
                        event.args.key,
                        event.args.account,
                        event.blockNumber,
                        event.args.collateralToken,
                        event.args.indexToken,
                        event.args.isLong
                    )
                    .catch((err) => console.log(err));
            })
        );
        await Promise.all(
            eventsClose.map(async (event) => {
                await positionService
                    .deletePosition(event.args.key, event.blockNumber)
                    .catch((err) => console.log(err));
            })
        );
        await Promise.all(
            eventsLiquidate.map(async (event) => {
                await positionService
                    .deletePosition(event.args.key, event.blockNumber)
                    .catch((err) => console.log(err));
            })
        );

        await parameterService.updateParameter("PROCESSED_LAST_BLOCK", toBlock.toString());
        lastSyncedBlock.set(toBlock);

        fromBlock = toBlock + 1;
        if (lastBlock.number - toBlock < maxProcessBlock) lastBlock = await provider.getBlock("latest");
    }

    const openPositions = await positionService.getPositions();

    return openPositions;
};

export default getOpenPositions;
