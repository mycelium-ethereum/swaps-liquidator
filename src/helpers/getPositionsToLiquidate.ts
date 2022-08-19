import { IPositionSchema } from "src/models/position";
import { Vault } from "@mycelium-ethereum/perpetual-swaps-contracts";

import PositionService, { IPositionService } from "./../services/position.service";
import { retry } from "./helpers";
const getPositionsToLiquidate = async (vault: Vault, openPositions: IPositionSchema[]) => {
    const positionService: IPositionService = new PositionService();

    let positionsToLiquidate: IPositionSchema[] = [];

    for (const position of openPositions) {
        const positionExists = await getPositionExists(position, vault);
        if (!positionExists) {
            await positionService.deletePosition(position.key, position.blockNumber).catch((err) => console.log(err));
            continue;
        }
        const liquidationState = await getLiquidationState(position, vault);
        if (liquidationState > 0) {
            console.log("ToLiquidatePosition******************************");
            console.log(`LiquidationState: ${liquidationState}`);
            console.log(position);
            positionsToLiquidate.push(position);
        }
    }

    return positionsToLiquidate;

    // const promises = openPositions.map(async (position) => {
    //     const positionExists = await getPositionExists(position, vault);
    //     if (!positionExists) {
    //         await positionService.deletePosition(position.key, position.blockNumber).catch((err) => console.log(err));
    //         return;
    //     }
    //     const liquidationState = await getLiquidationState(position, vault);
    //     if (liquidationState > 0) {
    //         console.log("ToLiquidatePosition******************************");
    //         console.log(`LiquidationState: ${liquidationState}`);
    //         console.log(position);
    //         return position;
    //     }
    // });
    // const positionsToLiquidate = await Promise.all(promises);
    // return positionsToLiquidate.filter(Boolean);
};

const getPositionExists = async (dbPosition: IPositionSchema, vault: Vault) => {
    try {
        const positionSize = await retry({
            fn: async () => {
                const [size] = await vault.getPosition(
                    dbPosition.account,
                    dbPosition.collateralToken,
                    dbPosition.indexToken,
                    dbPosition.isLong
                );
                return size;
            },
            shouldRetry: (err) => {
                return true;
            },
            maxRetries: 10,
            timeoutSeconds: 5,
        });
        return positionSize.gt(0);
    } catch (err) {
        console.error(err);
    }
};

const getLiquidationState = async (dbPosition: IPositionSchema, vault: Vault) => {
    try {
        const liquidationState = await retry({
            fn: async () => {
                const [state] = await vault.validateLiquidation(
                    dbPosition.account,
                    dbPosition.collateralToken,
                    dbPosition.indexToken,
                    dbPosition.isLong,
                    false
                );
                return state;
            },
            shouldRetry: (err) => {
                return true;
            },
            maxRetries: 10,
            timeoutSeconds: 5,
        });

        return liquidationState.toNumber();
    } catch (err) {
        console.error(err);
    }
};

export default getPositionsToLiquidate;
