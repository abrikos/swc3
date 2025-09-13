import mongoose from 'mongoose';

const model = 'category';

export interface ICategory extends mongoose.Document {
    name: string;
    deleted: boolean
    subcategories: ISubCategory[];
}

const Schema = mongoose.Schema;
const schema = new Schema<ICategory>({
    name: {type: String},
    deleted: {type: Boolean, default: false},

}, {
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
})

schema.virtual('subcategories', {
    ref: 'subcategory',
    localField: '_id',
    foreignField: 'category',
})


export const Category = mongoose.model<ICategory>(model, schema)
