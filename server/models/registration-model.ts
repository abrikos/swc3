import mongoose from 'mongoose';
import moment from "moment";

const model = 'registration';

export interface IReg extends mongoose.Document {
    firstName: string
    lastName: string
    middleName: string
    inn: string
    company: string
    jobTitle: string
    phone: string
    parent: string
    roles: string[]
    //isNetwork: {type: Boolean, default: false},
    //isSuperUser: {type: Boolean, default: false},
    email: string
    date: string
    fio: string
    password: string
    createdAt: Date
}

const Schema = mongoose.Schema;
const schema = new Schema<IReg>({
    firstName: {type: String},
    lastName: {type: String},
    middleName: {type: String},
    inn: {type: String},
    company: {type: String},
    jobTitle: {type: String},
    phone: {type: String},
    parent: {type: String},
    roles: [{type: String}],
    //isNetwork: {type: Boolean, default: false},
    //isSuperUser: {type: Boolean, default: false},
    email: {
        type: String,
        trim: true,
        lowercase: true,
        required: true,
    },

}, {
    timestamps: {createdAt: 'createdAt'},
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
})

schema.virtual('date')
    .get(function () {
        return moment(this.createdAt).format('YYYY-MM-DD HH:mm');
    })
schema.virtual('fio')
    .get(function () {
        return `${this.firstName} ${this.middleName} ${this.lastName}`
    })


export const Registration = mongoose.model<IReg>(model, schema)
