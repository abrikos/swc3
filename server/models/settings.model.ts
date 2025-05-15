import mongoose from 'mongoose';

const model = 'settings';

export interface ISettings extends mongoose.Document {
    course: number;
}

const Schema = mongoose.Schema;
const schema = new Schema<ISettings>({
    course: {type: Number},
}, {
    timestamps: {createdAt: 'createdAt'},
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
})

export const Settings = mongoose.model<ISettings>(model, schema)
