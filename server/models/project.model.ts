import mongoose from 'mongoose';
import moment from "moment";
import {IConf} from "~/server/models/conf.model";
import {IManager} from "~/server/models/manager.model";
import {IFile} from "~/server/models/file-model";

const statuses = ['Активный', "Успешный", "Не успешный"]
const model = 'project';

export interface IProject extends mongoose.Document {
    inn: string
    customer: string
    partner: string
    distributor: string
    status: string
    deleted: boolean
    specs: ISpec[]
    user: IUser
    manager: IManager
    files: IFile[]
    comment: string,
    order: string,
    month: number,
    year: number
    emails: string
    expireDate: Date
    createdAt: string
    specsAttached: ISpec[]

}

const Schema = mongoose.Schema;
const schema = new Schema<IProject>({
    inn: {type: String, required: true},
    customer: {type: String, required: true},
    partner: {type: String},
    distributor: {type: String},
    status: {type: String, default: statuses[0]},
    deleted: {type: Boolean, default: false},
    specs: [{type: mongoose.Schema.Types.ObjectId, ref: 'spec'},],
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    manager: {type: mongoose.Schema.Types.ObjectId, ref: 'manager'},
    files: [{type: mongoose.Schema.Types.ObjectId, ref: 'file'}],
    comment: String,
    order: String,
    month: {type: Number},
    year: {type: Number},
    emails: String,
    expireDate: {type: Date},

}, {
    timestamps: {createdAt: 'createdAt'},
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
})

interface IProjectModel extends mongoose.Model<IProject> {
    getPopulation: () => {}
}

schema.statics.getPopulation = () => [
    {path: 'specs', populate: Spec.getPopulation()},
    {path: 'specsAttached', populate: Spec.getPopulation()},
    {path: 'user', select: {id: 1}},
    'manager', 'files'
]

schema.statics.statusesArr = () => statuses

schema.virtual('date')
    .get(function () {
        return moment(this.createdAt).format('YYYY-MM-DD');
    })
schema.virtual('name')
    .get(function () {
        return `Заказчик: ${this.customer}.  Менеджер: ${this.manager?.name}`;
    })
schema.virtual('expiredDays')
    .get(function () {
        const exp = moment(this.expireDate)
        const now = moment()
        return now.diff(exp, 'days')
    })
schema.virtual('days')
    .get(function () {
        const now = moment();
        const created = moment(this.createdAt);
        return now.diff(created, 'days');
    })

schema.virtual('priceNet')
    .get(function () {
        return this.specsAttached?.reduce((a, b) => a + b.priceNet, 0)
    })
schema.virtual('priceServer')
    .get(function () {
        return this.specsAttached?.reduce((a, b) => a + b.priceServer, 0)
    })

schema.virtual('specsAttached', {
    ref: 'spec',
    localField: '_id',
    foreignField: 'project'
})

export const Project = mongoose.model<IProject, IProjectModel>(model, schema)
