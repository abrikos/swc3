import mongoose from 'mongoose';
import moment from "moment";

const model = 'component';

export interface IComponent extends mongoose.Document {
    platforms: string
    category: string,
    type: string,
    params: string,
    partNumber: string,
    descShort: string,
    descFull: string,
    powerConsumption: number
    price: number
    priceUsd: number
    priceDdp: number
    priceFob: number
    priceInput: number
    priceCost: number
    unitMin: number
    unitFix: number
    deleted: boolean
    createdAt: Date
    description: string
    isDiskSAS:boolean
    isDiskSATA:boolean
    isDiskM2SATA:boolean
    isDiskM2NVME:boolean
    isRearBaySAS:boolean
    isRearBayNVMe:boolean
    isSFF:boolean
    isLFF:boolean
    memorySize: number
    cpuCount: number
    lanPorts:number
    lanSpeed:number
    power: number
    riserPortsOnBoard:number
    riserForPort:number
    riserIsX16:boolean
    riserSlots:number
    pcieSlots: string
}

const Schema = mongoose.Schema;
const schema = new Schema<IComponent>({
    platforms: [{type: String}],
    category: String,
    type: String,
    params: String,
    partNumber: {type: String, unique: true, require: true},
    descShort: String,
    descFull: String,
    powerConsumption: {type: Number, default: 0},
    price: {type: Number, default: 0},
    priceUsd: {type: Number, default: 0},
    priceDdp: {type: Number, default: 0},
    priceFob: {type: Number, default: 0},
    priceInput: {type: Number, default: 0},
    priceCost: {type: Number, default: 0},
    unitMin: {type: Number, default: 0},
    unitFix: {type: Number, default: 0},
    deleted: {type: Boolean, default: false},
    pcieSlots: {type: String},

}, {
    timestamps: {createdAt: 'createdAt'},
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
})


schema.virtual('basketOrder')
    .get(function () {
        switch (this.category) {
            case 'CPU':
                return 1
            case 'Memory':
                return 2
            case 'Storage':
                return 3
            case 'Riser':
                return 4
            case 'PCI-E':
                return 5
            case 'Power':
                return 6
        }
        return 0
    })

schema.virtual('isSFF')
    .get(function () {
        return !!this.params?.match('SFF')
    })

schema.virtual('isDiskSAS')
    .get(function () {
        return ['HDD', 'SSD 2.5'].includes(this.type) && !!this.params?.match('SAS')
    })

schema.virtual('isDiskSATA')
    .get(function () {
        return ['HDD', 'SSD 2.5'].includes(this.type) && !!this.params?.match('SATA')
    })

schema.virtual('isDiskM2SATA')
    .get(function () {
        return this.type === 'SSD m.2' && !!this.params?.match('SATA')
    })
schema.virtual('isDiskM2NVME')
    .get(function () {
        return this.type === 'SSD m.2' && !!this.params?.match('NVMe')
    })

schema.virtual('isRearBaySAS')
    .get(function () {
        return ['Rear bay'].includes(this.type) && !!this.params?.match('SAS')
    })
schema.virtual('isRearBayNVMe')
    .get(function () {
        return ['Rear bay'].includes(this.type) && !!this.params?.match('NVMe')
    })

schema.virtual('isLFF')
    .get(function () {
        return !!this.params?.match('LFF')
    })

schema.virtual('memorySize')
    .get(function () {
        const match = this.params?.match(/(\d+)GB/)
        return match && match[1];
    })

schema.virtual('lanSpeed')
    .get(function () {
        const match = this.params?.match(/(\d+)G/)
        if(!match) return 0
        return match[1];
    })
schema.virtual('lanPorts')
    .get(function () {
        const match = this.params?.match(/(\d+)-port/)
        if(!match) return 0
        return match[1]
    })

schema.virtual('power')
    .get(function () {
        if(this.category !== 'Power' && !this.type) return 0
        const match = this.params?.match(/\s(\d+)W/)
        if(!match) return 0
        return parseInt(match[1])
    })

schema.virtual('riserIsX16')
    .get(function () {
        const match = this.params?.match('x16')
        return this.category === 'Riser' && match;
    })
schema.virtual('riserPortsOnBoard')
    .get(function () {
        if (this.category === 'Riser') {
            const m = this.params.match(/(x[\d]+)+/g)
            return m?.length
        }
        return 0
        //const match = this.partNumber.match(/^(\d)x/g)
        //return this.category === 'Riser' &&( match ? match[1] : 1);
    })

schema.virtual('riserForPort')
    .get(function () {
        const match = this.params?.match(/port (\d)/)
        if(!match) return 0
        return match[1]
    })
schema.virtual('riserSlots')
    .get(function () {
        if (this.category === 'Riser') {
            const match8 = this.params?.match(/(\d)\*x8/)
            const count8 = match8 ? parseInt(match8[1]) : 0
            const match16 = this.params?.match(/(\d)\*x16/)
            const count16 = match16 ? parseInt(match16[1]) : 0
            const match16_ = this.params?.match(/\sx16/)
            const count16_ = match16_ ? 1 : 0
            return count8 + count16 + count16_
        }
        return 0
    })

schema.virtual('riserUnit')
    .get(function () {
        const match = this.partNumber?.match(/(\d)U/)
        return match ? parseInt(match[1]) : 0;
    })

schema.virtual('forUnitInPN')
    .get(function () {
        const match = this.partNumber?.match(/(\d)U/)
        return match ? parseInt(match[1]) : 0;
    })


schema.virtual('description')
    .get(function () {
        return this.descFull || this.descShort;
    })

schema.virtual('date')
    .get(function () {
        return moment(this.createdAt).format('YYYY-MM-DD HH:mm');
    })


export const Component = mongoose.model<IComponent>(model, schema)
