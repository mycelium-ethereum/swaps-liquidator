import { Counter } from "prom-client";

export const liquidations = new Counter({
    name: "trs_liquidations_success",
    help: "Liquidation calls",
    labelNames: ["number"],
});

export const liquidationErrors = new Counter({
    name: "trs_liquidation_errors",
    help: "Liquidation call errors",
    labelNames: ["error"],
});
