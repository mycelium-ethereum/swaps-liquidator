import { ethers } from "ethers";
import colors from "colors";
import { Vault__factory } from "../typechain";
import getOpenPositions from "../src/helpers/getOpenPositions";
import getPositionsToLiquidate from "../src/helpers/getPositionsToLiquidate";

const liquidationHandler = async function () {
    try {
        const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
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

        console.log("STEP 4: Vault Call Directly");
        positionsToLiquidate.forEach(async (position) => {
            console.info(
                colors.yellow(`Liquidating ${position.isLong ? "long" : "short"} position ${position.key}...`)
            );

            const tx = await vault.liquidatePosition(
                position.account,
                position.collateralToken,
                position.indexToken,
                position.isLong,
                process.env.FEE_RECEIVER_ADDRESS
            );
            const receipt = await tx.wait();
            console.info(colors.green(`Liquidated ${position.isLong ? "long" : "short"} position ${position.key}!`));
            console.info(colors.green(`Transaction hash: ${receipt.transactionHash}`));
        });

        console.info("OK, liquidated all positions.");
        return;
    } catch (err) {
        console.error("Error occured in liquidate.ts:handler");
        console.error(err);
    }
};

let isProcessing = false;
export default async () => {
    if (isProcessing) {
        console.info("Liquidation is already processing.");
        return;
    }
    isProcessing = true;
    await liquidationHandler();
    isProcessing = false;
};
