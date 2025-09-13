import mongoose from 'mongoose';
import {ISubCategory} from "~/server/models/subcategory";
import {IConf} from "~/server/models/conf.model";
import {IOrderSubItem} from "~/server/models/order-subitem";

const model = 'device';

export interface IDevice extends mongoose.Document {
    name: string
    isPower: boolean
    torp: boolean
    description: string
    price: number
    discount1: number
    discount2: number
    discount3: number
    deleted: boolean
    canAdd: boolean
    tabs: any[]
    powerNames: string[]
    powerCount: number
    subcategory: ISubCategory
    services: INetService[]
    powers: IDevice[]
    trans: IDevice[];
}

interface IDeviceModel extends mongoose.Model<IDevice> {
    getPopulation: () => []
}


const Schema = mongoose.Schema;
const schema = new Schema<IDevice>({
    name: {type: String},
    isPower: {type: Boolean, default: false},
    torp: {type: Boolean, default: false},
    description: {type: String},
    price: {type: Number},
    discount1: {type: Number},
    discount2: {type: Number},
    discount3: {type: Number},
    deleted: {type: Boolean, default: false},
    powerNames: [{type: String}],
    powerCount: {type: Number, default: 0},
    subcategory: {type: mongoose.Schema.Types.ObjectId, ref: 'subcategory'},
    powers: [{type: mongoose.Schema.Types.ObjectId, ref: 'device'}],
    trans: [{type: mongoose.Schema.Types.ObjectId, ref: 'device'}],

}, {
    timestamps: {createdAt: 'createdAt'},
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
})
schema.statics.getPopulation = () => ['powers', 'services', 'trans', {path: 'subcategory', populate: 'category'}]

schema.virtual('canAdd')
    .get(function () {
        return !!this.tabs.length
    })

schema.virtual('tabs')
    .get(function () {
        const r = []
        if (this.powers.length) r.push({name: 'powers', label: 'Блоки питания', icon:'mdi-power-plug'})
        if (this.services?.length) r.push({name: 'services', label: 'Тех. поддержка', icon:'mdi-face-agent'})
        if (this.trans.length) r.push({name: 'trans', label: 'Трансиверы', icon:'mdi-toslink'})
        //if(this.subcategory.name.match('точки доступа')) r.push({name:'licenses',label:'Лицензии'})
        return r

    })


schema.virtual('services', {
    ref: 'netservice',
    localField: '_id',
    foreignField: 'device'
})

export const Device = mongoose.model<IDevice, IDeviceModel>(model, schema)
