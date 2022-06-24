import { Schema, model } from "mongoose";

export interface ILiquidationSchema {
    key: string;
    account: string;
    collateralToken: string;
    indexToken: string;
    isLong: boolean;
    createdAt: Date;
}

const liquidationSchema = new Schema<ILiquidationSchema>({
    key: { type: String, required: true },
    account: { type: String, required: true },
    collateralToken: { type: String, required: true },
    indexToken: { type: String, required: true },
    isLong: { type: Boolean, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Liquidation = model<ILiquidationSchema>("Liquidation", liquidationSchema);

export default Liquidation;
