import mongoose from 'mongoose';

const model = 'service';

export interface IService extends mongoose.Document {
    partNumber: string,
    article: string
    name: string,
    price: number
    priceDdp: number
    priceFob: number
    priceNet: number
    discount1: number,
    discount2: number,
    level: string,
    period: number,
    coefficient: number,
}

const Schema = mongoose.Schema;
const schema = new Schema<IService>({
    partNumber: String,
    article: {type:String, require: true, unique: true},
    name: String,
    price: {type:Number, default:0},
    priceDdp: {type:Number, default:0},
    priceFob: {type:Number, default:0},
    priceNet: {type:Number, default:0},
    discount1: Number,
    discount2: Number,
    level: String,
    period: Number,
    coefficient: Number,

}, {
    timestamps: {createdAt: 'createdAt'},
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
})

export const Service = mongoose.model<IService>(model, schema)
