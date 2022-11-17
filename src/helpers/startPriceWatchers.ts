import { Provider } from "@ethersproject/providers";
import {
    FastPriceEvents__factory,
    Vault__factory,
    VaultPriceFeed__factory,
} from "@mycelium-ethereum/perpetual-swaps-contracts";
import { BigNumber, ethers, Event } from "ethers";
import LiquidationService from "../services/liquidation.service";
import PositionService from "../services/position.service";
import getPositionsToLiquidate from "./getPositionsToLiquidate";
import { createProvider } from "./helpers";
import EACAggregatorProxy from "../../abis/EACAggregatorProxy.json";
import Aggregator from "../../abis/AccessControlledOffchainAggregator.json";
import { liquidationErrors } from "../utils/prometheus";

const liquidationService = new LiquidationService();

// To ensure that each price update is handled only once, we need to keep track of the last processed
// block number and transaction index. This is stored as a decimal number in the format
// "blockNumber.transactionIndex"
const lastUpdateByToken: Record<string, number> = {};

export const startPriceWatchers = async () => {
    const providers: Provider[] = [createProvider(process.env.RPC_URL), createProvider(process.env.FALLBACK_RPC_URL)];

    // Setup FastPriceFeed listeners
    providers.forEach((provider) => {
        const fastPriceEvents = FastPriceEvents__factory.connect(process.env.FAST_PRICE_EVENTS_ADDRESS, provider);
        fastPriceEvents.on("PriceUpdate", (token: string, price: BigNumber, sender: string, event: Event) => {
            try {
                const updateValue = Number(`${event.blockNumber}.${event.transactionIndex}`);
                if (lastUpdateByToken[token] >= updateValue) {
                    // This event has already been processed
                    return;
                }
                lastUpdateByToken[token] = updateValue;

                console.log(`Price update for ${token}`);

                checkForLiquidations(provider, token);
            } catch (err) {
                console.error(err);
                liquidationErrors.inc({ error: err.message });
            }
        });
    });

    // Setup Chainlink listeners
    providers.forEach(async (provider) => {
        const tokens = await getVaultTokens(provider);

        tokens.forEach(async (token) => {
            // Check for liquidations on startup
            checkForLiquidations(provider, token);

            const aggregatorProxy = await getCLAggregatorProxy(token, provider);
            let aggregatorAddr: string = await aggregatorProxy.aggregator();
            let aggregator = new ethers.Contract(aggregatorAddr, Aggregator, provider);

            console.log(`Listening for price updates for ${token} at ${aggregatorAddr}`);

            const onCLPriceUpdate = (current: BigNumber, roundId: BigNumber, updatedAt: BigNumber, event: Event) => {
                try {
                    const updateValue = Number(`${event.blockNumber}.${event.transactionIndex}`);
                    if (lastUpdateByToken[token] >= updateValue) {
                        // This event has already been processed
                        return;
                    }
                    lastUpdateByToken[token] = updateValue;

                    console.log(`Price update for ${token}`);

                    checkForLiquidations(provider, token);
                } catch (err) {
                    console.error(err);
                    liquidationErrors.inc();
                }
            };

            aggregator.on("AnswerUpdated", onCLPriceUpdate);

            // The aggregator contract doesn't emit an event when the aggregator is updated,
            // so we need to poll for it
            setInterval(async () => {
                const newAggregatorAddr: string = await aggregatorProxy.aggregator();
                if (newAggregatorAddr !== aggregatorAddr) {
                    console.log(`Aggregator for ${token} updated to ${newAggregatorAddr}`);

                    aggregator.removeAllListeners();
                    aggregatorAddr = newAggregatorAddr;
                    aggregator = new ethers.Contract(newAggregatorAddr, Aggregator, provider);

                    aggregator.on("AnswerUpdated", onCLPriceUpdate);
                }
            }, 60000);
        });
    });
};

async function checkForLiquidations(provider: Provider, token: string) {
    const positionService = new PositionService();

    const openPositions = await positionService.getPositions(token);
    const positionsToLiquidate = await getPositionsToLiquidate(provider, openPositions);

    if (positionsToLiquidate.length > 0) {
        console.log(`[${token}] Found ${positionsToLiquidate.length} positions to liquidate`);
        liquidationService.liquidate(positionsToLiquidate);
    }
}

async function getVaultTokens(provider: Provider) {
    const vault = Vault__factory.connect(process.env.VAULT_ADDRESS, provider);
    const numTokens = await vault.allWhitelistedTokensLength();
    const indexes = Array.from(Array(numTokens.toNumber()).keys());

    let tokens: string[] = [];

    await Promise.all(
        indexes.map(async (idx) => {
            const token = await vault.allWhitelistedTokens(idx);
            const isWhitelisted = await vault.whitelistedTokens(token);
            if (!isWhitelisted) return;

            tokens.push(token);
        })
    );

    return tokens;
}

async function getCLAggregatorProxy(token: string, provider: Provider) {
    const vault = Vault__factory.connect(process.env.VAULT_ADDRESS, provider);
    const priceFeedAddr = await vault.priceFeed();
    const vaultPriceFeed = VaultPriceFeed__factory.connect(priceFeedAddr, provider);

    const aggregatorProxyAddr = await vaultPriceFeed.priceFeeds(token);
    const aggregatorProxy = new ethers.Contract(aggregatorProxyAddr, EACAggregatorProxy, provider);
    return aggregatorProxy;
}
