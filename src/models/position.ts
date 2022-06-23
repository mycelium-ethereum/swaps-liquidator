import { Schema, model } from "mongoose";

export interface IPositionSchema {
    key: string;
    account: string;
    blockNumber:number;
    collateralToken: string;
    indexToken:string;
    isLong: boolean;
    createdAt?: Date;   
}

const positionSchema = new Schema<IPositionSchema>({
    key: { type: String, required: true },
    account: { type: String, required: true },
    blockNumber:{ type: Number, required: false },
    collateralToken: { type: String, required: true },
    indexToken:{ type: String, required: true },
    isLong: { type: Boolean, required: true },
    createdAt: { type: Date, default: Date.now },    
});

const Position = model<IPositionSchema>("Position", positionSchema);

export default Position;

