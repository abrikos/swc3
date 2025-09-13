import mongoose from 'mongoose';

const model = 'subcategory';

export interface ISubCategory extends mongoose.Document {
    name: string;
    deleted: boolean
    category: ICategory
}

const Schema = mongoose.Schema;
const schema = new Schema<ISubCategory>({
    name: {type: String},
    category: {type: mongoose.Schema.Types.ObjectId, ref: 'category'},
    deleted: {type: Boolean, default: false},

}, {
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
})

export const SubCategory = mongoose.model<ISubCategory>(model, schema)
