import { IPositionSchema } from "../models/position";
import colors from 'colors';
import { PositionManager } from "@mycelium-ethereum/perpetual-swaps-contracts";
import { liquidations } from "../utils/prometheus";

export const liquidateInBatches = async (positions: IPositionSchema[], positionManager: PositionManager) => {
    let cursor = 0;
    const positionsPerTransaction = 50;
    while (cursor < positions.length) {
        const batchPositions = positions.slice(cursor, cursor + positionsPerTransaction);
        if (batchPositions.length === 1) {
            // If there is only one position, sometimes the batch transaction doesn't work for some reason
            // so we just send it separately
            console.log(colors.yellow(`Liquidating ${batchPositions.length} position`));
            const position = batchPositions[0];
            const tx = await positionManager.liquidatePosition(
                position.account,
                position.collateralToken,
                position.indexToken,
                position.isLong,
                process.env.FEE_RECEIVER_ADDRESS
            );
            const receipt = await tx.wait();
            console.log(colors.green(`Sent!`));
            console.log(colors.green(`Transaction receipt: ${receipt.transactionHash}`));
        } else {
            const accounts = batchPositions.map((position) => position.account);
            const collateralTokens = batchPositions.map((position) => position.collateralToken);
            const indexTokens = batchPositions.map((position) => position.indexToken);
            const isLongs = batchPositions.map((position) => position.isLong);

            console.log(colors.yellow(`Liquidating positions ${cursor} to ${cursor + batchPositions.length}...`));
            const tx = await positionManager.liquidatePositions(
                accounts,
                collateralTokens,
                indexTokens,
                isLongs,
                process.env.FEE_RECEIVER_ADDRESS
            );
            const receipt = await tx.wait();

            console.log(colors.green(`Sent!`));
            console.log(colors.green(`Transaction hash: ${receipt.transactionHash}`));
        }

        liquidations.inc(batchPositions.length);
        cursor += positionsPerTransaction;
    }
}

export const liquidateOneByOne = async (positions: IPositionSchema[], positionManager: PositionManager) => {
    for (const position of positions) {
        console.log(colors.yellow(`Liquidating position ${position.account}`));
        const tx = await positionManager.liquidatePosition(
            position.account,
            position.collateralToken,
            position.indexToken,
            position.isLong,
            process.env.FEE_RECEIVER_ADDRESS
        );
        const receipt = await tx.wait();
        console.log(colors.green(`Sent!`));
        console.log(colors.green(`Transaction hash: ${receipt.transactionHash}`));
        liquidations.inc(1);
    }
}