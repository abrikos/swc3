import mongoose from 'mongoose';
import moment from "moment";
import {IConf} from "~/server/models/conf.model";
import {IOrderItem} from "~/server/models/order-item.model";

const model = 'order';

export interface IOrder extends mongoose.Document {
    name: string
    count: number
    user: IUser
    createdAt: Date
    sum:number
    total:number
    items: IOrderItem[]
}

interface IOrderModel extends mongoose.Model<IOrder> {
    getPopulation: ()=>[]
}


const Schema = mongoose.Schema;
const schema = new Schema<IOrder>({
    name: String,
    count: {type: Number, default: 1},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},

}, {
    timestamps: {createdAt: 'createdAt'},
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
})

schema.statics.getPopulation = () => [
    {path: 'items', populate: OrderItem.getPopulation()}
]

schema.virtual('date')
    .get(function () {
        return moment(this.createdAt).format('YYYY-MM-DD HH:mm');
    })

schema.virtual('sum')
    .get(function () {
        return this.items.reduce(function (sum:number, item) {
            return sum + ((item.device?.price||0) + (item.service?.price||0)) * item.count
        }, 0);
    })
schema.virtual('total')
    .get(function () {
        return this.sum *  this.count;
    })
// schema.virtual('totalFixed')
//     .get(function () {
//         return this.total.toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');
//     })
// schema.virtual('sumFixed')
//     .get(function () {
//         return this.sum.toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');
//     })


schema.virtual('items', {
    ref: 'orderItem',
    localField: '_id',
    foreignField: 'order',
})


export const Order = mongoose.model<IOrder, IOrderModel>(model, schema)
