import Position,{ IPositionSchema }  from "../models/position";




export interface IPositionService {
    getPositions:() => Promise<IPositionSchema[]>;
    createNewPosition: (
        key: string,
        account: string,
        blockNumber:number,
        collateralToken: string,
        indexToken:string,
        isLong: boolean
    ) => Promise<void>;
    deletePosition: (key: string, blockNumber: number) => Promise<void>;
}

class PositionService implements IPositionService {

    async getPositions():Promise<IPositionSchema[]>{
        const docs = await Position.find();

        return docs;
    }

    async createNewPosition(
        key: string,
        account: string,
        blockNumber:number,
        collateralToken: string,
        indexToken:string,
        isLong: boolean
    ): Promise<void> {
        try {
            const foundPosition = await Position.findOne({ key });

            if (foundPosition) {
                return;
            }

            const newPosition = new Position({ key,
                account,
                blockNumber,
                collateralToken,
                indexToken,
                isLong });

            await newPosition.save();
            console.log(`New position is saved. Key: ${key}`);
        } catch (err: any) {
            throw new Error(err);
        }
    }
    async deletePosition(key: string, blockNumber: number): Promise<void> {
        try {
            await Position.deleteMany({ key: key, blockNumber: { $lte: blockNumber } });
            console.log(`Position is deleted. Key: ${key}`);
        } catch (err: any) {
            throw new Error(err);
        }
    }
}

export default PositionService;
