import crypto from "crypto";
import mongoose from 'mongoose';
import moment from "moment";

const name = 'chassis'

const Schema = mongoose.Schema;

export interface IChassis extends mongoose.Document {
    [key: string]: any

    partNumber: string
    createdAt: string
    parseDigits: { disks: number, units: number }
    _doc: any
}


const schema = new Schema<IChassis>({
        platform: {type: String},
        disksFormFactor: String,
        paramsData: Object,
        partNumber: {type: String, unique: true},
        descShort: String,
        descFull: String,
        name: String,
        params: String,
        hidden: {type: Boolean, default: false},
        price: {type: Number, default: 0},
        priceFob: {type: Number, default: 0},
        priceDdp: {type: Number, default: 0},
        deleted: {type: Boolean, default: false}
    },
    {
        timestamps: {createdAt: 'createdAt'},
        toObject: {virtuals: true},
        // use if your results might be retrieved as JSON
        // see http://stackoverflow.com/q/13133911/488666
        toJSON: {virtuals: true}
    });


schema.virtual('date')
    .get(function () {
        return moment(this.createdAt).format('YYYY-MM-DD HH:mm');
    })

schema.virtual('parseDigits')
    .get(function () {
        const dig = this.partNumber.split('-')[1]
        const matchStr = this.platform === 'JBOD' ? dig.match(/(\d)(\d\d)/) : dig.match(/(\d)(\d)(\d\d)(\d\d)/)
        if (matchStr) {
            const match = matchStr.map(d=>parseInt(d))
            return {units: match[1], cpu: match[2], disks: match[3] || match[2], ether: match[4]}
        }
    })

schema.virtual('disks')
    .get(function () {
        //if(this.platform === 'JBOD')            console.log(this.partNumber, this.parseDigits.disks)
        //Количество дисков берем из 3 и 4 цифры из парт-номера
        return this.parseDigits.disks
    })
schema.virtual('lanPort1Gb')
    .get(function () {
        const match = this.descFull?.match('(\\d).1GbE LAN')
        if (match && typeof match[1] === 'number') {
            return match && match[1] * 1
        }

    })

schema.virtual('disksOnlySmall')
    .get(function () {
        return this.type === 'SFF'
    })

schema.virtual('cpu')
    .get(function () {
        if (this.platform !== 'JBOD') {
            return this.platform === 'AMD' ? 'AMD' : 'Intel';
        }
    })

schema.virtual('isSFF')
    .get(function () {
        return this.disksFormFactor === 'SFF'
    })

schema.virtual('isLFF')
    .get(function () {
        return this.disksFormFactor === 'LFF'
    })

schema.virtual('units')
    .get(function () {
        return this.parseDigits.units
        //const match = this.descFull.match(/(\d)U/)
        //return match[1] * 1
    })

schema.virtual('services', {
    ref: 'service',
    localField: 'partNumber',
    foreignField: 'partNumber'
})

export const Chassis = mongoose.model<IChassis>(name, schema)
