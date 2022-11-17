require("dotenv").config();
import mongoose, { MongooseOptions } from "mongoose";
import express from "express";
import { Registry } from "prom-client";
import { resetMetrics, registerMetrics } from "./src/utils/prometheus";
import { sleep } from "./src/helpers/helpers";
import { syncOpenPositions } from "./src/helpers/syncOpenPositions";
import { startPriceWatchers } from "./src/helpers/startPriceWatchers";
const app = express();

const INTERVAL = process.env.INTERVAL_MS ? parseInt(process.env.INTERVAL_MS) : 60000;
const IS_PAUSED = process.env.IS_PAUSED === "true";

app.listen(process.env.PORT, async () => {
    console.info("*** Server started on port " + process.env.PORT + " ***");
    resetMetrics();
    await connectToDatabase();

    if (!IS_PAUSED) {
        startSyncInterval();
        startPriceWatchers();
    }
});

const connectToDatabase = async () => {
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

const startSyncInterval = async () => {
    console.log(`Starting sync interval with ${INTERVAL}ms interval`);
    while (true) {
        await syncOpenPositions();
        await sleep(INTERVAL / 1000);
    }
};

app.get("/", function (_req, res) {
    res.send("Mycelium Swaps Liquidator");
});

// Prometheus metrics
const registry = new Registry();
registerMetrics(registry);

app.get("/metrics", async (req, res) => {
    res.setHeader("Content-Type", registry.contentType);
    res.send(await registry.metrics());
});
