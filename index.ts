require("dotenv").config();
import liquidationHandler from "./api/liquidate";
import mongoose, { MongooseOptions } from "mongoose";
import ON_DEATH from "death";
import express from "express";
import cron from "node-cron";
const app = express();

const main = async () => {
    try {
        await connectDatabase();
        console.info("*** STARTING LIQUIDATOR INTERVAL" + "***");
        cron.schedule(process.env.START_CRON, async () => {
            await liquidationHandler();
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
    await main();
});

const connectDatabase = async () => {
    try {
        const dbUrl = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
        await mongoose.connect(dbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        } as MongooseOptions);

        console.log("Database connected!");
    } catch (err) {
        console.log("Failed to connect to database!", err);
    }
};
