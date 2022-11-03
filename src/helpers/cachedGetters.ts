import { Vault } from "@mycelium-ethereum/perpetual-swaps-contracts";
import { BigNumber } from "ethers";
import Cache from "node-cache";

const INTERVAL = process.env.INTERVAL_MS ? parseInt(process.env.INTERVAL_MS) : 60000;
const cache = new Cache({ stdTTL: INTERVAL / 1000 });
const ONE_DAY = 60 * 60 * 24;

export const getTokenPrice = async (address: string, isLong: boolean, vault: Vault) => {
    const key = `getPrice-${address}-${isLong}`;
    const cachedPrice = cache.get(key);
    if (cachedPrice) {
        return BigNumber.from(cachedPrice);
    } else {
        console.log("Fetching new value for " + key);
        const price = isLong ? await vault.getMinPrice(address) : await vault.getMaxPrice(address);
        cache.set(key, price.toString());
        return price;
    }
};

export const getCumulativeFundingRate = async (token: string, vault: Vault) => {
    const key = `getCumulativeFundingRate-${token}`;
    const cachedValue = cache.get(key);
    if (cachedValue) {
        return BigNumber.from(cachedValue);
    } else {
        console.log("Fetching new value for " + key);
        const cumulativeFundingRate = await vault.cumulativeFundingRates(token);
        cache.set(key, cumulativeFundingRate.toString());
        return cumulativeFundingRate;
    }
};

export const getLiquidationFee = async (vault: Vault) => {
    const key = `getLiquidationFee`;
    const cachedValue = cache.get(key);
    if (cachedValue) {
        return BigNumber.from(cachedValue);
    } else {
        console.log("Fetching new value for " + key);
        const liquidationFee = await vault.liquidationFeeUsd();
        cache.set(key, liquidationFee.toString(), ONE_DAY);
        return liquidationFee;
    }
};

export const getMarginFeeBps = async (vault: Vault) => {
    const key = `getMarginFeeBps`;
    const cachedValue = cache.get(key);
    if (cachedValue) {
        return BigNumber.from(cachedValue);
    } else {
        console.log("Fetching new value for " + key);
        const marginFeeBps = await vault.marginFeeBasisPoints();
        cache.set(key, marginFeeBps.toString(), ONE_DAY);
        return marginFeeBps;
    }
};
