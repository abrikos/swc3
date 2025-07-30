import mongoose from 'mongoose';
import {IDevice} from "~/server/models/device.model";
import {IOrder} from "~/server/models/order.model";
import {IConf} from "~/server/models/conf.model";

const model = 'orderSubItem';

export interface IOrderSubItem extends mongoose.Document {
    device: IDevice;
    item: IOrderItem,
    service: INetService,
    count: number,
}

interface IOrderSubItemModel extends mongoose.Model<IOrderSubItem> {
    getPopulation: ()=>[]
}


const Schema = mongoose.Schema;
const schema = new Schema<IOrderSubItem>({
    device: {type: mongoose.Schema.Types.ObjectId, ref: 'device'},
    service: {type: mongoose.Schema.Types.ObjectId, ref: 'netservice'},
    item: {type: mongoose.Schema.Types.ObjectId, ref: 'orderItem'},
    count: {type: Number, default: 1},
}, {
    timestamps: {createdAt: 'createdAt'},
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
})

schema.statics.getPopulation = () => [{path: 'device', populate: Device.getPopulation()},'service']

export const OrderSubItem = mongoose.model<IOrderSubItem, IOrderSubItemModel>(model, schema)
