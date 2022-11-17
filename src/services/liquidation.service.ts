import { ethers } from "ethers";
import colors from "colors";
import { IPositionSchema } from "../models/position";
import { transactionErrors, liquidations } from "../utils/prometheus";
import { connectToBlockchain } from "../helpers/helpers";
import { PositionManager__factory } from "@mycelium-ethereum/perpetual-swaps-contracts";

// Handles all liquidations
// Uses singleton and queue to avoid nonce errors
class LiquidationService {
    private static _instance: LiquidationService;
    private queue: IPositionSchema[] = [];
    private readonly BATCH_SIZE = 50;
    private isProcessing = false;

    constructor() {
        if (LiquidationService._instance) {
            return LiquidationService._instance;
        }
        LiquidationService._instance = this;
    }

    public liquidate(positions: IPositionSchema[]) {
        const newPositions = positions.filter((position) => !this.queue.some((p) => p.key === position.key));
        this.queue.push(...newPositions);
        this.processQueue();
    }

    private async processQueue() {
        if (this.isProcessing) {
            return;
        }
        this.isProcessing = true;
        while (this.queue.length) {
            const provider = await connectToBlockchain();
            const signer = new ethers.Wallet(process.env.LIQUIDATOR_PRIVATE_KEY, provider);
            const positionManager = PositionManager__factory.connect(process.env.POSITION_MANAGER_ADDRESS, signer);

            let batch = this.queue.splice(0, this.BATCH_SIZE);
            const feeReceiver = process.env.FEE_RECEIVER_ADDRESS;

            // When liquidating a batch, errors are swallowed which wastes gas
            // So we check each position individually before the batch call
            await Promise.all(
                batch.map(async (position) => {
                    try {
                        await positionManager.estimateGas.liquidatePosition(
                            position.account,
                            position.indexToken,
                            position.collateralToken,
                            position.isLong,
                            feeReceiver
                        );
                    } catch (err) {
                        batch = batch.filter((p) => p.key !== position.key);
                    }
                })
            );
            if (batch.length === 0) continue;

            const accounts = batch.map((position) => position.account);
            const collateralTokens = batch.map((position) => position.collateralToken);
            const indexTokens = batch.map((position) => position.indexToken);
            const isLongs = batch.map((position) => position.isLong);

            // For some reason, the last position in the batch is not liquidated
            // so we add a null value to the end of the arrays to fix this
            accounts.push(ethers.constants.AddressZero);
            collateralTokens.push(ethers.constants.AddressZero);
            indexTokens.push(ethers.constants.AddressZero);
            isLongs.push(false);

            console.log(colors.yellow(`Liquidating ${batch.length} positions...`));
            const tx = await positionManager.liquidatePositions(
                accounts,
                collateralTokens,
                indexTokens,
                isLongs,
                feeReceiver
            );

            const receipt = await tx.wait();

            console.log(colors.green(`Sent!`));
            console.log(colors.green(`Transaction hash: ${receipt.transactionHash}`));

            let numErrors = 0;
            receipt.events?.forEach((ev) => {
                if (ev.event === "LiquidationError" && ev.args?.account !== ethers.constants.AddressZero) {
                    console.log(`Liquidation Error: ${ev.args?.reason}`);
                    console.log(`\tAccount: ${ev.args?.account}`);
                    console.log(`\tIndex token: ${ev.args?.indexToken}`);
                    transactionErrors.inc();
                    numErrors++;
                }
            });
            if (numErrors > 0) console.log(colors.red(`There were ${numErrors} errors in this transaction`));

            liquidations.inc(batch.length - numErrors);
        }
        this.isProcessing = false;
    }
}

export default LiquidationService;
