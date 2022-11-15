import { Provider } from "@ethersproject/providers";
import { FastPriceEvents__factory } from "@mycelium-ethereum/perpetual-swaps-contracts";
import { BigNumber, ethers, Event } from "ethers";
import { connectToBlockchain, createProvider } from "./helpers";

export const startPriceWatchers = async () => {
    const providers: Provider[] = [createProvider(process.env.RPC_URL), createProvider(process.env.FALLBACK_RPC_URL)];

    providers.forEach((provider) => {
        const fastPriceEvents = FastPriceEvents__factory.connect(process.env.FAST_PRICE_EVENTS_ADDRESS, provider);
        fastPriceEvents.on("PriceUpdate", handleFastPriceUpdate);
    });
};

// To ensure that each price update is handled exactly once, we need to keep track of the last processed block number and
// transaction index. We do this for each token as two token prices can be updated in the same transaction
// This is stored as a decimal number in the format "blockNumber.transactionIndex"
const idempotencyRecord: Record<string, number> = {};

async function handleFastPriceUpdate(token: string, price: BigNumber, sender: string, event: Event) {
    const idempotencyKey = Number(`${event.blockNumber}.${event.transactionIndex}`);
    if (idempotencyRecord[token] >= idempotencyKey) {
        // This event has already been processed
        console.log(`Skipping already processed event for token ${token}`);
        return;
    }
    idempotencyRecord[token] = idempotencyKey;
    console.log(`Price update for ${token} to ${price.toString()} by ${sender}`);
}
