import { IPositionSchema } from "src/models/position";
import { Vault } from "src/typechain";

import PositionService, { IPositionService } from "./../services/position.service";

const MAX_BATCH_SIZE = 100;

const getPositionsToLiquidate = async (vault: Vault, openPositions: IPositionSchema[]) => {
    const positionService: IPositionService = new PositionService();

    let positionsToLiquidate: IPositionSchema[] = [];
    let pointer = 0;
    while (pointer < openPositions.length) {
        const batch = openPositions.slice(pointer, pointer + MAX_BATCH_SIZE);

        const promises = batch.map(async (dbPosition) => {
            try {
                const liquidationState = await getLiquidationState(dbPosition, vault);

                if (liquidationState === undefined) {
                    await positionService.deletePosition(dbPosition.key, dbPosition.blockNumber).catch((err) => console.log(err));
                    return;
                } else if (liquidationState > 0) {
                    console.log("ToLiquidatePosition******************************");
                    console.log(`LiquidationState: ${liquidationState}`);
                    console.log(dbPosition);
                    return dbPosition;
                }
            } catch (err) {
                console.log(err);
            }
        });

        let batchLiquidationPositions = await Promise.all(promises);
        batchLiquidationPositions = batchLiquidationPositions.flat().filter(Boolean);

        positionsToLiquidate = [...positionsToLiquidate, ...batchLiquidationPositions];
        pointer += MAX_BATCH_SIZE;
    }

    return positionsToLiquidate;
};

const getLiquidationState = async (dbPosition: IPositionSchema, vault: Vault) => {
    const [liquidationState] = await vault.validateLiquidation(dbPosition.account, dbPosition.collateralToken, dbPosition.indexToken, dbPosition.isLong, false);
    return liquidationState.toNumber();
};

export default getPositionsToLiquidate;
