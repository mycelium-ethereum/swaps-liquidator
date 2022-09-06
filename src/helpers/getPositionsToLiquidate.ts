import { IPositionSchema } from "src/models/position";
import { Vault } from "@mycelium-ethereum/perpetual-swaps-contracts";
import Cache from "node-cache";
import { retry } from "./helpers";
import { BigNumber, ethers } from "ethers";

const getPositionsToLiquidate = async (vault: Vault, openPositions: IPositionSchema[]) => {
    const maxLeverageBps = process.env.MAX_LEVERAGE_BPS ? BigNumber.from(process.env.MAX_LEVERAGE_BPS) : BigNumber.from(500000);
    const basisPointsDivisor = 10000;

    const positionsOverMaxLeverage: IPositionSchema[] = [];
    for (const position of openPositions) {
        const size = BigNumber.from(position.size);
        const liquidationMargin = size.mul(basisPointsDivisor).div(maxLeverageBps);


        const price = await getTokenPrice(position.indexToken, position.isLong, vault);
        const collateral = BigNumber.from(position.collateralAmount);
        const delta = getDelta(position, price);
        const remainingCollateral = collateral.add(delta);
        
        if (remainingCollateral.lte(liquidationMargin)) {
            positionsOverMaxLeverage.push(position);
        }
    }

    console.log(`Positions over max leverage: ${positionsOverMaxLeverage.length}`);

    // Confirm in contract that position is liquidatible
    const positionsToLiquidate: IPositionSchema[] = [];
    await Promise.all(positionsOverMaxLeverage.map(async (position) => {
        const liquidationState = await getLiquidationState(position, vault);
        if (liquidationState > 0) {
            console.log("ToLiquidatePosition******************************");
            console.log(`LiquidationState: ${liquidationState}`);
            console.log(position);
            positionsToLiquidate.push(position);
        }
    }));

    return positionsToLiquidate;
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

        if (!liquidationState) return 0;
        return liquidationState.toNumber();
    } catch (err) {
        console.error(err);
    }
};

const INTERVAL = process.env.INTERVAL_MS ? parseInt(process.env.INTERVAL_MS) : 60000;
const priceCache = new Cache({ stdTTL: INTERVAL / 1000 });
const getTokenPrice = async (address: string, isLong: boolean, vault: Vault) => {
    const key = `${address}-${isLong}`;
    const cachedPrice = priceCache.get(key) as BigNumber | undefined;
    if (cachedPrice) {
        return cachedPrice;
    } else {
        console.log("Fetching new price for " + key);
        const price = isLong ? await vault.getMinPrice(address) : await vault.getMaxPrice(address);
        priceCache.set(key, price);
        return price;
    }
};

const getDelta = (position: IPositionSchema, price: BigNumber) => {
    const collateral = BigNumber.from(position.collateralAmount);
    const size = BigNumber.from(position.size);
    const averagePrice = BigNumber.from(position.averagePrice);
    const priceDelta = position.isLong ? price.sub(averagePrice) : averagePrice.sub(price);
    const delta = size.mul(priceDelta).div(averagePrice);

    return delta;
};

export default getPositionsToLiquidate;
