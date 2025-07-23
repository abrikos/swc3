import crypto from "crypto";
import mongoose from 'mongoose';
import moment from "moment";
import {IRole, Role} from "~/server/models/role.model";
import {IDevice} from "~/server/models/device.model";

export interface IUser extends mongoose.Document {
    [key: string]: any

    type: string
    firstName: string
    lastName: string
    middleName: string
    inn: string
    company: string
    jobTitle: string
    phone: string
    parent: string
    code2fa: string
    isNetwork: boolean,
    isSuperUser: boolean,
    email: string
    logged: number,
    course: number
    blocked: boolean
    passwordHash: string
    resetCode: string
    currency: string
    fio: string
    role: string
    roles: IRole[]
    //order: IOrder
    configurations: IConf[]
    specs: ISpec[]
    specsCount: number
    ordersCount: number
}

interface IUserModel extends mongoose.Model<IUser> {
    getPopulation: () => []
}


const Schema = mongoose.Schema;
export const validateEmail = function (email: string) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/.test(email);
};


export function md5(str: string) {
    return crypto.createHash('md5').update(str).digest('hex')
}


const schema = new Schema<IUser>({
    type: {type: String},
    firstName: {type: String},
    lastName: {type: String},
    middleName: {type: String},
    inn: {type: String},
    company: {type: String},
    jobTitle: {type: String},
    phone: {type: String},
    parent: {type: String},
    code2fa: {type: String},
    //isNetwork: {type: Boolean, default: false},
    //isSuperUser: {type: Boolean, default: false},
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: true,
        validate: [validateEmail, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/, 'Please fill a valid email address']
    },
    logged: Number,
    course: {type: Number, default: 1},
    blocked: {type: Boolean, default: false},
    passwordHash: {type: String},
    resetCode: {type: String},
    currency: {type: String, default: 'Рубли'},
    role: {type: String, default: 'External'},
    roles: [{type: mongoose.Schema.Types.ObjectId, ref: 'role'}],
    //order: {type: mongoose.Schema.Types.ObjectId, ref: 'order'},
}, {
    timestamps: {createdAt: 'createdAt'},
    toObject: {virtuals: true},
    // use if your results might be retrieved as JSON
    // see http://stackoverflow.com/q/13133911/488666
    toJSON: {virtuals: true}
})

schema.methods.checkPasswd = function (passwd: string) {
    return md5(passwd) === this.passwordHash;
}
schema.statics.getPopulation = () => ['specsCount', 'roles']


schema.virtual('password')
    .get(function () {
        return '';
    })
    .set(function (value) {
        //console.log('Password change', value);
        this.passwordHash = md5(value)
    })

schema.virtual('date')
    .get(function () {
        return moment(this.createdAt).format('YYYY-MM-DD HH:mm');
    })
schema.virtual('fio')
    .get(function () {
        return `${this.firstName || ''} ${this.middleName || ''} ${this.lastName || ''}`
    })
schema.virtual('isAdmin')
    .get(function () {
        return this.role === 'admin';
    })
schema.virtual('isNetwork')
    .get(function () {
        return ['admin', 'Internal'].includes(this.role);
    })
schema.virtual('isEmployer')
    .get(function () {
        return ['admin', 'Internal'].includes(this.role);
    })
schema.virtual('isProject')
    .get(function () {
        return ['admin', 'Internal'].includes(this.role);
    })
schema.virtual('isAnalytic')
    .get(function () {
        return ['admin', 'Internal'].includes(this.role);
    })
schema.virtual('isSettings')
    .get(function () {
        return ['admin'].includes(this.role);
    })
schema.virtual('isServer')
    .get(function () {
        return true
    })
schema.virtual('isSuperUser')
    .get(function () {
        return ['admin'].includes(this.role);
    })

schema.virtual('loggedDate')
    .get(function () {
        if (!this.logged) return '';
        return moment.unix(this.logged).format('YYYY-MM-DD HH:mm');
    })


schema.virtual('tokens', {
    ref: 'token',
    localField: '_id',
    foreignField: 'user'
})

schema.virtual('configurations', {
    ref: 'configuration',
    localField: '_id',
    foreignField: 'user'
})

schema.virtual('specsCount', {
    ref: 'spec',
    localField: '_id',
    foreignField: 'user',
    count: true
})

schema.virtual('specs', {
    ref: 'spec',
    localField: '_id',
    foreignField: 'user',
})

schema.virtual('ordersCount', {
    ref: 'order',
    localField: '_id',
    foreignField: 'user',
    count: true
})
export const User = mongoose.model<IUser, IUserModel>('user', schema)
