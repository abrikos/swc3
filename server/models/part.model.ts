import mongoose from 'mongoose';
import {IConf} from "~/server/models/conf.model";
import {IComponent} from "~/server/models/component.model";

const model = 'part';

export interface IPart extends mongoose.Document {
    configuration: IConf
    component: IComponent
    port: number,
    count: number,
    price: number,
    deleted: boolean
}

const Schema = mongoose.Schema;
const schema = new Schema<IPart>({
    configuration: {type: mongoose.Schema.Types.ObjectId, ref: 'configuration'},
    component: {type: mongoose.Schema.Types.ObjectId, ref: 'component'},
    port: Number,
    count: Number,
    deleted:{type:Boolean, default:false}

}, {
    timestamps: {createdAt: 'createdAt'},
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
})

schema.virtual('price')
    .get(function () {
        return this.component.price * this.count;
    })


export const Part = mongoose.model<IPart>(model, schema)
