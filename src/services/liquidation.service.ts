import Liquidation from "../models/liquidation";

export interface ILiquidationService {
    recordLiquidation: (key: string, account: string, collateralToken: string, indexToken: string, isLong: boolean) => Promise<void>;
}

class LiquidationService implements ILiquidationService {
    async recordLiquidation(key: string, account: string, collateralToken: string, indexToken: string, isLong: boolean): Promise<void> {
        try {
            const newLiquidation = new Liquidation({ key, account, collateralToken, indexToken, isLong });
            await newLiquidation.save();
            console.log(`New liquidation is saved. Key: ${key}`);
        } catch (err: any) {
            throw new Error(err);
        }
    }
}

export default LiquidationService;
