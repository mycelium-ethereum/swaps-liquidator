import { PositionManager__factory, Vault__factory } from "@mycelium-ethereum/perpetual-swaps-contracts";
import { ethers } from "ethers";
import { checkProviderHealth } from "../utils";

export const sleep = async (seconds: number) => {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

export const retry = async <T>({
    fn,
    maxRetries = 10,
    shouldRetry,
    timeoutSeconds = 10,
}: {
    fn: () => Promise<T>;
    shouldRetry: (error: any) => boolean;
    maxRetries: number;
    timeoutSeconds: number;
}) => {
    let retries = 0;
    while (true) {
        try {
            return await fn();
        } catch (e) {
            if (!shouldRetry(e)) {
                throw e;
            } else if (retries >= maxRetries) {
                throw e;
            } else {
                console.log(`${new Date().toISOString()}: RETRY #${retries + 1}`);
                console.error(JSON.stringify(e, null, 2));
                retries++;
                await sleep(timeoutSeconds);
            }
        }
    }
};

export const connectToBlockchain = async () => {
    let provider = createProvider(process.env.RPC_URL);
    const isProviderHealthy = await checkProviderHealth(provider);
    if (!isProviderHealthy) {
        console.log("Main provider is not healthy. Switching to fallback provider.");
        provider = createProvider(process.env.FALLBACK_RPC_URL);
    }

    return provider;
};

export const isWsProvider = (url: string) => {
    const protocol = url.split(":")[0];
    return protocol === "wss" || protocol === "ws";
};

export const createProvider = (url: string) => {
    if (isWsProvider(url)) {
        console.log(`Creating websocket provider: ${url}`);
        return new ethers.providers.WebSocketProvider(url);
    }

    console.log(`Creating jsonRPC provider: ${url}`);
    return new ethers.providers.JsonRpcProvider(url);
};
