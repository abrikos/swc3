import mongoose from 'mongoose';

const model = 'manager';

export interface IManager extends mongoose.Document {
    dep: string
    name: string,
    title: string,
    phoneIn: string,
    phone: string,
    email: string,
    deleted: boolean
}

const Schema = mongoose.Schema;
const schema = new Schema<IManager>({
    dep: {type:String, require: true},
    name: String,
    title: String,
    phoneIn: String,
    phone: String,
    email: String,
    deleted: {type: Boolean, default: false},

}, {
    timestamps: {createdAt: 'createdAt'},
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
})

export const Manager = mongoose.model<IManager>(model, schema)
