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
