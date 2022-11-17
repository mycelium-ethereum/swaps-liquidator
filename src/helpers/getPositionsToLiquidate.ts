import { IPositionSchema } from "src/models/position";
import { Vault, Vault__factory } from "@mycelium-ethereum/perpetual-swaps-contracts";
import { BigNumber } from "ethers";
import { getCumulativeFundingRate, getLiquidationFee, getMarginFeeBps, getTokenPrice } from "./cachedGetters";
import { Provider } from "@ethersproject/providers";

const MAX_LEVERAGE_BPS = process.env.MAX_LEVERAGE_BPS
    ? BigNumber.from(process.env.MAX_LEVERAGE_BPS)
    : BigNumber.from(500000);
const BASIS_POINTS_DIVISOR = 10000;

const getPositionsToLiquidate = async (provider: Provider, positions: IPositionSchema[]) => {
    const vault = Vault__factory.connect(process.env.VAULT_ADDRESS, provider);

    const positionsToLiquidate: IPositionSchema[] = [];
    await Promise.all(
        positions.map(async (position) => {
            const size = BigNumber.from(position.size);
            const liquidationMargin = size.mul(BASIS_POINTS_DIVISOR).div(MAX_LEVERAGE_BPS);

            const price = await getTokenPrice(position.indexToken, position.isLong, vault);
            const collateral = BigNumber.from(position.collateralAmount);
            const delta = getDelta(position, price);
            const remainingCollateral = collateral.add(delta);

            const fees = await calculateFees(position, vault);

            if (remainingCollateral.lt(fees)) {
                positionsToLiquidate.push(position);
            } else if (remainingCollateral.lte(liquidationMargin)) {
                positionsToLiquidate.push(position);
            }
        })
    );

    return positionsToLiquidate;
};

const getDelta = (position: IPositionSchema, price: BigNumber) => {
    const size = BigNumber.from(position.size);
    const averagePrice = BigNumber.from(position.averagePrice);
    const priceDelta = position.isLong ? price.sub(averagePrice) : averagePrice.sub(price);
    return size.mul(priceDelta).div(averagePrice);
};

async function calculateFees(position: IPositionSchema, vault: Vault) {
    const fundingFee = await getFundingFee(position, vault);
    const positionFee = await getPositionFee(position, vault);
    const liquidationFee = await getLiquidationFee(vault);
    return fundingFee.add(positionFee).add(liquidationFee);
}

const FUNDING_RATE_PRECISION = 1000000;
async function getFundingFee(position: IPositionSchema, vault: Vault): Promise<BigNumber> {
    const cumulativeFundingRate = await getCumulativeFundingRate(position.indexToken, vault);
    const fundingRate = cumulativeFundingRate.sub(position.entryFundingRate);
    if (fundingRate.eq(0)) {
        return BigNumber.from(0);
    }
    return BigNumber.from(position.size).mul(fundingRate).div(FUNDING_RATE_PRECISION);
}

async function getPositionFee(position: IPositionSchema, vault: Vault) {
    const marginFeeBps = await getMarginFeeBps(vault);
    return BigNumber.from(position.size).mul(marginFeeBps).div(BASIS_POINTS_DIVISOR);
}

export default getPositionsToLiquidate;
