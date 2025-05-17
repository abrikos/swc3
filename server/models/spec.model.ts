import mongoose from 'mongoose';
import moment from "moment";
import {IOrder} from "~/server/models/order.model";
import {IConf} from "~/server/models/conf.model";

const model = 'spec';

export interface ISpec extends mongoose.Document {
    name: string
    shared: IUser
    project: IProject
    configurations: IConf[],
    orders: IOrder[],
    user: IUser
    createdAt: string
    priceNet: number
    priceServer: number
    date: string
}

interface ISpecModel extends mongoose.Model<ISpec> {
    getPopulation: ()=>any
}


const Schema = mongoose.Schema;
const schema = new Schema<ISpec>({
    name: {type: String},
    shared: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    project: {type: mongoose.Schema.Types.ObjectId, ref: 'project'},
    configurations: [{type: mongoose.Schema.Types.ObjectId, ref: 'configuration'}],
    orders: [{type: mongoose.Schema.Types.ObjectId, ref: 'order'}],
}, {
    timestamps: {createdAt: 'createdAt'},
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
})

schema.statics.getPopulation = ()=>[
    {path: 'configurations', populate: Conf.getPopulation()},
    {path: 'orders', populate: Order.getPopulation()},
    {path: 'shared', select: {email: 1}},
    {path: 'project', populate: 'manager'},

]

schema.virtual('date')
    .get(function () {
        return moment(this.createdAt).format('YYYY-MM-DD');
    })


schema.virtual('priceServer')
    .get(function () {
        let sum = 0;
        for(const conf of this.configurations){
            sum += conf.priceTotal
        }
        return sum
    })

schema.virtual('priceNet')
    .get(function () {
        let sum = 0;
        for(const order of this.orders){
            sum += order.total
        }

        return sum
    })


export const Spec = mongoose.model<ISpec, ISpecModel>(model, schema)
