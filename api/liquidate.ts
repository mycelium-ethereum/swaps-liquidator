import { ethers } from "ethers";
import colors from "colors";
import { Vault__factory, PositionManager__factory } from "@mycelium-ethereum/perpetual-swaps-contracts";
import getOpenPositions from "../src/helpers/getOpenPositions";
import getPositionsToLiquidate from "../src/helpers/getPositionsToLiquidate";
import { checkProviderHealth } from "../src/utils";
import { liquidationErrors, liquidations } from "../src/utils/prometheus";

const liquidationHandler = async function () {
    try {
        let provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);

        const isProviderHealthy = await checkProviderHealth(provider);
        if (!isProviderHealthy) {
            console.log(colors.red("Main provider is not healthy. Switching to fallback provider."));
            provider = new ethers.providers.JsonRpcProvider(process.env.FALLBACK_RPC_URL);
        }

        const signer = new ethers.Wallet(`0x${process.env.LIQUIDATOR_PRIVATE_KEY}`, provider);
        const vault = Vault__factory.connect(process.env.VAULT_ADDRESS, signer);
        const positionManager = PositionManager__factory.connect(process.env.POSITION_MANAGER_ADDRESS, signer);

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

        console.log("STEP 4: Liquidate positions");

        let cursor = 0;
        const positionsPerTransaction = 50;
        while (cursor < positionsToLiquidate.length) {
            const positions = positionsToLiquidate.slice(cursor, cursor + positionsPerTransaction);

            if (positions.length === 1) {
                // If there is only one position, sometimes the batch transaction doesn't work for some reason
                // so we just send it separately
                console.log(colors.yellow(`Liquidating ${positions.length} position`));
                const position = positions[0];
                const tx = await positionManager.liquidatePosition(
                    position.account,
                    position.collateralToken,
                    position.indexToken,
                    position.isLong,
                    process.env.FEE_RECEIVER
                );
                const receipt = await tx.wait();
                console.log(colors.green(`Sent!`));
                console.log(colors.green(`Transaction receipt: ${receipt.transactionHash}`));
            } else {
                const accounts = positions.map((position) => position.account);
                const collateralTokens = positions.map((position) => position.collateralToken);
                const indexTokens = positions.map((position) => position.indexToken);
                const isLongs = positions.map((position) => position.isLong);
                
                console.log(colors.yellow(`Liquidating positions ${cursor} to ${cursor + positions.length}...`));
                const tx = await positionManager.liquidatePositions(
                    accounts,
                    collateralTokens,
                    indexTokens,
                    isLongs,
                    process.env.FEE_RECEIVER_ADDRESS
                    );
                    const receipt = await tx.wait();
                    
                    for (let i = 0; i < positions.length; i++) {
                        liquidations.inc();
                    }
                    
                    console.log(colors.green(`Sent!`));
                    console.log(colors.green(`Transaction hash: ${receipt.transactionHash}`));
                }

            cursor += positionsPerTransaction;
        }

        console.log("OK, all positions liquidated.");

        return;
    } catch (error) {
        liquidationErrors.inc({ error: error.message });
        console.error("Error occured in liquidate.ts:handler");
        console.error(error);
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
