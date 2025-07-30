import mongoose from 'mongoose';
import {IDevice} from "~/server/models/device.model";
import {IOrder} from "~/server/models/order.model";
import {IConf} from "~/server/models/conf.model";
import {IOrderSubItem, OrderSubItem} from "~/server/models/order-subitem";

const model = 'orderItem';

export interface IOrderItem extends mongoose.Document {
    device: IDevice;
    order: IOrder,
    subItems: IOrderSubItem[]
    count: number,
    sort: number,
    powerItemsCount: number,
}

interface IOrderItemModel extends mongoose.Model<IOrderItem> {
    getPopulation: ()=>[]
}


const Schema = mongoose.Schema;
const schema = new Schema<IOrderItem>({
    device: {type: mongoose.Schema.Types.ObjectId, ref: 'device'},
    order: {type: mongoose.Schema.Types.ObjectId, ref: 'order'},
    count: {type: Number, default: 1},
    sort: {type: Number, default: 0},
}, {
    timestamps: {createdAt: 'createdAt'},
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
})

schema.virtual('powerItemsCount')
    .get(function () {
        return this.subItems?.filter(s=>this.device.powers.map(p=>p.name).includes(s.device?.name)).reduce((a: number, b: IOrderSubItem) => a + b.count, 0)
    })


schema.virtual('subItems', {
    ref: 'orderSubItem',
    localField: '_id',
    foreignField: 'item'
})


schema.statics.getPopulation = () => [{path: 'device', populate: Device.getPopulation()},{path: 'subItems', populate: OrderSubItem.getPopulation()}];

export const OrderItem = mongoose.model<IOrderItem, IOrderItemModel>(model, schema)
