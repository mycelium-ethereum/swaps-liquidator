require("dotenv").config();
import liquidationHandler from "./api/liquidate";
import mongoose, { MongooseOptions } from "mongoose";
import ON_DEATH from "death";
import express from "express";
import { asyncInterval } from "./src/utils";
import { Registry } from "prom-client";
import { liquidationErrors, liquidations, lastSyncedBlock } from "./src/utils/prometheus";
const app = express();

const INTERVAL = process.env.INTERVAL_MS ? parseInt(process.env.INTERVAL_MS) : 60000;
const IS_PAUSED = process.env.IS_PAUSED === "true";

const main = async () => {
    try {
        // initialise all metrics to 0
        liquidationErrors.inc(0);
        liquidations.inc(0);
        lastSyncedBlock.inc(0);

        await connectDatabase();
        console.info("*** STARTING LIQUIDATOR INTERVAL" + "***");
        asyncInterval({
            fn: liquidationHandler,
            delayMs: INTERVAL,
            runImmediately: true,
        });

        ON_DEATH({
            uncaughtException: true,
        })((signal, deathErr) => {
            console.error(`*** SIGNAL: ${signal} ***`);
            console.error(`*** deathErr: ${deathErr} ***`);
            process.exit(0);
        });
    } catch (err) {
        console.error("Error occured in index.ts:main");
        console.error(err);
    }
};

app.get("/", function (_req, res) {
    res.send("Tracer Swaps Liquidator");
});

app.listen(process.env.PORT, async () => {
    console.info("*** Server started on port " + process.env.PORT + " ***");
    if (!IS_PAUSED) {
        await main();
    }
});

const connectDatabase = async () => {
    try {
        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        } as MongooseOptions);

        console.log("Database connected!");
    } catch (err) {
        console.log("Failed to connect to database!", err);
    }
};

// Prometheus metrics
const registry = new Registry();
registry.registerMetric(liquidations);
registry.registerMetric(liquidationErrors);
registry.registerMetric(lastSyncedBlock);

app.get("/metrics", async (req, res) => {
    res.setHeader("Content-Type", registry.contentType);
    res.send(await registry.metrics());
});
