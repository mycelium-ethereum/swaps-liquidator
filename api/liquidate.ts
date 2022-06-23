import { ethers } from "ethers";

import { Vault__factory } from "../src/typechain";

import getOpenPositions from "../src/helpers/getOpenPositions";

import getPositionsToLiquidate from "../src/helpers/getPositionsToLiquidate";
import { getGasOptions, sendTxn } from "../src/helpers/helpers";
import colors from "colors";
import fs from "fs";

const liquidationHandler = async function () {
    try {
        const provider = new ethers.providers.JsonRpcBatchProvider(process.env.RPC_URL);
        const signer = new ethers.Wallet(`0x${process.env.LIQUIDATOR_PRIVATE_KEY}`, provider);
        const vault = Vault__factory.connect(process.env.VAULT_ADDRESS, signer);

        console.log("STEP 1: Get open positions");

        const openPositions = await getOpenPositions(vault, provider);

        console.info("openPositions.length: " + openPositions.length);

        if (openPositions.length === 0) {
            console.info("OK, nothing liquidated.");
            return;
        }

        console.log("STEP 2: Get positions to liquidate");
        const positionsToLiquidate = await getPositionsToLiquidate(vault, openPositions);

        console.log("positionsToLiquidate.length: " + positionsToLiquidate.length);

        console.log("STEP 3: Check liquidations");
        if (positionsToLiquidate.length === 0) {
            console.info("OK, nothing liquidated.");
            return;
        }

        // Get gas options for first transaction as a base for all other transactions
        const [position1] = positionsToLiquidate;
        // const gasOptions = await getGasOptions(vault, "liquidatePosition", [
        //     position1.account,
        //     position1.collateralToken,
        //     position1.indexToken,
        //     position1.isLong,
        //     process.env.LIQUIDATOR_ADDRESS,
        // ]);

        console.log("STEP 4: Vault Call Directly");
        positionsToLiquidate.forEach(async (o) => {
            // While testing, we want to see the liquidation events in the console
            console.info(colors.cyan(`Liquidating ${o.isLong ? "long" : "short"} position ${o.key}`));
            console.log(`\tAccount: ${o.account}`);
            console.log(`\tCollateral token: ${o.collateralToken}`);
            console.log(`\tIndex token: ${o.indexToken}`);
            console.log(`\tIs long: ${o.isLong}`);

            // Write to file the info, will compare to the liquidation events on GMX later
            fs.appendFileSync("./liquidation.log", `${new Date().toISOString()}: ${o.account} ${o.collateralToken} ${o.indexToken} ${o.isLong}\n`);

            // await sendTxn(
            //     vault,
            //     "liquidatePosition",
            //     [o.account, o.collateralToken, o.indexToken, o.isLong, process.env.LIQUIDATOR_ADDRESS],
            //     gasOptions,
            //     "liquidatePosition =>" + o.account + "-" + o.collateralToken + "-" + o.indexToken + "-" + o.isLong
            // );
        });

        return;
    } catch (err) {
        console.error("Error occured in liquidate.ts:handler");
        console.error(err);
    }
};

export default liquidationHandler;
