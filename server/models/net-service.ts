import mongoose from 'mongoose';

const model = 'netservice';

export interface INetService extends mongoose.Document {
    description: string
    name: string
    article: string
    price: number
    level: string
    period: number
    device: IDevice
}

const Schema = mongoose.Schema;
const schema = new Schema<INetService>({
    description: {type:String, require: true},
    name: String,
    article: String,
    price: {type:Number, default:0},
    level: String,
    period: Number,
    device: {type: mongoose.Schema.Types.ObjectId, ref: 'device'},

}, {
    timestamps: {createdAt: 'createdAt'},
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
})

export const NetService = mongoose.model<INetService>(model, schema)
