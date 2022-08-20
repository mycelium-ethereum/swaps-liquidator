import { IPositionSchema } from "src/models/position";
import { Vault } from "@mycelium-ethereum/perpetual-swaps-contracts";

import { retry } from "./helpers";
import { BigNumber, ethers } from "ethers";

const getPositionsToLiquidate = async (vault: Vault, openPositions: IPositionSchema[]) => {
    const maxLeverageBps = await vault.maxLeverage();
    const basisPointsDivisor = 10000;

    const promises = openPositions.map(async (position) => {
        const price = await getTokenPrice(position.indexToken, position.isLong, vault);
        const margin = getMargin(position, price);
        const size = BigNumber.from(position.size);

        const shouldLiquidate = margin.mul(maxLeverageBps).lt(size.mul(basisPointsDivisor));

        if (shouldLiquidate) {
            // Confirm that the position is liquidatible
            const liquidationState = await getLiquidationState(position, vault);
            if (liquidationState > 0) {
                console.log("ToLiquidatePosition******************************");
                console.log(`LiquidationState: ${liquidationState}`);
                console.log(position);
                return position;
            }
        }
    });
    const positionsToLiquidate = await Promise.all(promises);
    return positionsToLiquidate.filter(Boolean);
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

type PriceCache = {
    [key: string]: {
        value: BigNumber;
        timestamp: number;
    };
};
const priceCache: PriceCache = {};
const getTokenPrice = async (address: string, isLong: boolean, vault: Vault) => {
    const key = `${address}-${isLong}`;
    const cacheExpiry = 60 * 1000; // 1 minute
    if (priceCache[key] && priceCache[key].timestamp + cacheExpiry < Date.now()) {
        return priceCache[key].value;
    } else {
        const price = isLong ? await vault.getMinPrice(address) : await vault.getMaxPrice(address);
        priceCache[key] = {
            value: price,
            timestamp: Date.now(),
        };
        return price;
    }
};

const getMargin = (position: IPositionSchema, price: BigNumber) => {
    const collateral = BigNumber.from(position.collateralAmount);
    const size = BigNumber.from(position.size);
    const averagePrice = BigNumber.from(position.averagePrice);
    const priceDelta = position.isLong ? price.sub(averagePrice) : averagePrice.sub(price);

    const delta = size.mul(priceDelta).div(averagePrice);
    return collateral.add(delta);
};

export default getPositionsToLiquidate;
