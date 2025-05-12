import mongoose from 'mongoose';

const model = 'role'


export interface IRole extends mongoose.Document {
    name: string;
    deleted: boolean;
}


const Schema = mongoose.Schema;

const schema = new Schema({
    name: {type: String},
    deleted: {type: Boolean, default: false},

}, {
    toObject: {virtuals: true},
    // use if your results might be retrieved as JSON
    // see http://stackoverflow.com/q/13133911/488666
    toJSON: {virtuals: true}
})

export const Role = mongoose.model<IRole>(model, schema)
