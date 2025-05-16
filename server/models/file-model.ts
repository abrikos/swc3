import mongoose from 'mongoose';

const model = 'file';

export interface IFile extends mongoose.Document {
    user: IUser
    name: string
    mimetype: string
    size: number
    deleted: boolean
}

const Schema = mongoose.Schema;
const schema = new Schema<IFile>({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    name: {type: String},
    mimetype: {type: String},
    size: {type: Number},
    deleted: {type: Boolean, default: false},

}, {
    timestamps: {createdAt: 'createdAt'},
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
})

export const File = mongoose.model<IFile>(model, schema)
