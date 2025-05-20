import mongoose from 'mongoose';
import {IDevice} from "~/server/models/device.model";
import {IOrder} from "~/server/models/order.model";
import {IConf} from "~/server/models/conf.model";

const model = 'orderItem';

export interface IOrderItem extends mongoose.Document {
    device: IDevice;
    powerForDevice: IDevice;
    transForDevice: IDevice;
    licenseForDevice: IDevice;
    order: IOrder,
    count: number,
    sortName: string,
    license: string
    service: IService

}

interface IOrderItemModel extends mongoose.Model<IOrderItem> {
    getPopulation: ()=>[]
}


const Schema = mongoose.Schema;
const schema = new Schema<IOrderItem>({
    device: {type: mongoose.Schema.Types.ObjectId, ref: 'device'},
    powerForDevice: {type: mongoose.Schema.Types.ObjectId, ref: 'device'},
    transForDevice: {type: mongoose.Schema.Types.ObjectId, ref: 'device'},
    licenseForDevice: {type: mongoose.Schema.Types.ObjectId, ref: 'device'},
    order: {type: mongoose.Schema.Types.ObjectId, ref: 'order'},
    count: {type: Number, default: 1},
    sortName: String,
    license: {type: String, default: ''},
    service: {type: mongoose.Schema.Types.ObjectId, ref: 'netservice'},

}, {
    timestamps: {createdAt: 'createdAt'},
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
})

schema.statics.getPopulation = () => [{path: 'device', populate: Device.getPopulation()}, 'powerForDevice']

export const OrderItem = mongoose.model<IOrderItem, IOrderItemModel>(model, schema)
