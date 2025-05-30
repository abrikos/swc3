import mongoose from 'mongoose';
import moment from "moment/moment";

const model = 'file';

export interface IFile extends mongoose.Document {
    user: IUser
    name: string
    fileName: string
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

schema.virtual('fileName')
    .get(function () {
        return this.id + '-' + this.name
    })

export const FileModel = mongoose.model<IFile>(model, schema)
