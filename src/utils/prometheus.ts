import { Counter, Gauge } from "prom-client";

export const liquidations = new Counter({
    name: "swaps_liquidations_success",
    help: "Liquidation calls",
});

export const liquidationErrors = new Counter({
    name: "swaps_liquidation_errors",
    help: "Liquidation call errors",
    labelNames: ["error"],
});

export const lastSyncedBlock = new Gauge({
    name: "swaps_liquidation_last_synced_block",
    help: "Last synced blocknumber",
});

export const ethBalance = new Gauge({
    name: "swaps_liquidation_eth_balance",
    help: "ETH balance",
});

export const registerMetrics = (registry) => {
    registry.registerMetric(liquidations);
    registry.registerMetric(liquidationErrors);
    registry.registerMetric(lastSyncedBlock);
    registry.registerMetric(ethBalance);
};

export const resetMetrics = () => {
    liquidations.reset();
    liquidationErrors.reset();
    lastSyncedBlock.reset();
    ethBalance.reset();

    liquidations.inc(0);
    liquidationErrors.inc(0);
    lastSyncedBlock.inc(0);
};
