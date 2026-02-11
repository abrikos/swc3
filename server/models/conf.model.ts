import mongoose, {Model} from 'mongoose';
import {Chassis} from "~/server/models/chassis.model";
import {User} from "~/server/models/user.model";
import moment from "moment";

const model = 'configuration'

export interface IConf extends mongoose.Document {
    name: string;
    createdAt: Date;
    count: number;
    price: number;
    priceComponents: number;
    user: IUser
    chassis: IChassis
    service: IService
    draft: boolean
    brokenStorageService: boolean
    partsSorted: IPart[]
    parts: IPart[]
    rearBayCount: number
    rearBaysNeeded: number
    nvmeCount: number
    powerConsumption: number
    power: number
    cpuCount: number
    riserSlots: number
    riserMaxCount: number
    riserIsX16: boolean
    anybayCount: number
    priceTotal: number
    description: string
    priceService: number
    storagePrice: number
    powerCoefficient: number
    pcieComponentSlots: string
    pcieRiserSlots: string

}

interface IConfModel extends mongoose.Model<IConf> {
    getPopulation(): any

    createCustom(chassisId: string, user: IUser): IConf
}

const Schema = mongoose.Schema;

const schema = new Schema<IConf>({
    name: {type: String},
    count: {type: Number, default: 1, min: 0},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    chassis: {type: mongoose.Schema.Types.ObjectId, ref: 'chassis'},
    service: {type: mongoose.Schema.Types.ObjectId, ref: 'service'},
    draft: {type: Boolean, default: true},
    brokenStorageService: {type: Boolean, default: false}
}, {
    timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'},
    toObject: {virtuals: true},
    // use if your results might be retrieved as JSON
    // see http://stackoverflow.com/q/13133911/488666
    toJSON: {virtuals: true}
})
const population = [
    {path: 'parts', populate: {path: 'component'}},
    {path: 'chassis'},
    {path: 'service'}
]
schema.statics.getPopulation = () => population

schema.statics.createCustom = async function (chassisId, user) {
    const chassis = await Chassis.findById(chassisId)
    if (!chassis) return null;
    const service = await Service.findOne({level: 'BAS', period: 3, partNumber:undefined})
    const configuration = await this.create({
        chassis,
        service,
        user,
        name: 'Конфигурация от ' + moment().format('YYYY-MM-DD HH-mm')
    })
    await configuration.populate(population);
    // if (chassis.platform !== 'JBOD' && chassis.partNumber !== 'QSRV-260802-E-R' && !['QSRV-260802-P-R', 'QSRV-261202-P-R', 'QSRV-262402-P-R'].includes(chassis.partNumber)) {
    //     const partNumber = configuration.chassis.units === 1 ? chassis.platform === 'G3R' ? 'x16riser1U' : 'zzzz' : '3x8riser2U'
    //     const component = await Component.findOne({partNumber})
    //     if (component) {
    //         await Part.create({component, configuration, count: 1})
    //     }
    // }

    // if (chassis.platform === 'G2R') {
    //     const partNumber = (['QSRV-160812-E-R', 'QSRV-160402-E-R', 'QSRV-160412-E-R', 'QSRV-160802-E-R'].includes(chassis.partNumber) ? 'PSU065R' : 'PSU08R')
    //     const componentPower = await Component.findOne({partNumber})
    //     await Part.create({component: componentPower, configuration, count: 1})
    // }

    if (['QSRV-181000'].includes(chassis.partNumber)) {
        const riser1 = await Component.findOne({partNumber: 'x16riser1U5.0'})
        const riser2 = await Component.findOne({partNumber: 'x8riser1ULP5.0'})
        await Part.create({component: riser1, configuration, count: 1})
        await Part.create({component: riser2, configuration, count: 1})
    }
    if (['QSRV-281200', 'QSRV-282400'].includes(chassis.partNumber)) {
        const riser1 = await Component.findOne({partNumber: 'x16x8riser2U5.0'})
        const riser2 = await Component.findOne({partNumber: '2x16riser2U5.0'})
        const riser3 = await Component.findOne({partNumber: '3x16riser2U5.0'})
        await Part.create({component: riser1, configuration, count: 1})
        await Part.create({component: riser2, configuration, count: 1})
        await Part.create({component: riser3, configuration, count: 1})
    }
    const componentPowerCable = await Component.findOne({partNumber: 'C13-SCH'})
    //console.log(componentPowerCable)
    if (componentPowerCable) {
        await Part.create({component: componentPowerCable, configuration, count: 2})
    }
    if (chassis.platform === 'G2R' && chassis.units === 2) {
        const bpl = await Component.findOne({partNumber: 'rbaySFFSAS'})
        await Part.create({component: bpl, configuration, count: 1})
    }
    if (['QSRV-161002', 'QSRV-1710', 'QSRV-161002A', 'QSRV-260802', 'QSRV-270802', 'QSRV-260802A'].includes(chassis.partNumber)) {
        const componentBackplane = await Component.findOne({partNumber: 'bplnss'})
        await Part.create({component: componentBackplane, configuration, count: 1})
    }
    return configuration
}

schema.virtual('pcieRiserSlots')
    .get(function (){
        return  this.partsSorted.filter(c => c.component?.pcieSlots && c.component.category === 'Riser').map(c=>({count:c.count, slots:c.component.pcieSlots}))
    })

schema.virtual('pcieComponentSlots')
    .get(function (){
        return  this.partsSorted.filter(c => c.component?.pcieSlots && c.component.category !== 'Riser').map(c=>({count:c.count, slots:c.component.pcieSlots}))
    })

schema.virtual('description')
    .get(function () {
        if (!this.chassis) return
        const anyBayBackplane = this.partsSorted.find(c => c.component?.descFull.match('AnyBay'))
        const confName = [this.chassis.name + ' ' + (anyBayBackplane ? 'AnyBay' : 'SAS/SATA')]
        for (const part of this.partsSorted.filter(p => p.component?.partNumber !== 'C13-SCH')) {
            if (part.component?.category === 'Power' && this.chassis.lanPort1Gb) {
                confName.push(this.chassis.lanPort1Gb + '*1GbE LAN')
            }
            if(part.component?.partNumber.match('BEZEL')){
                confName.push(part.component?.partNumber)
            }else {
                confName.push(part.count + '* ' + part.component?.description)
            }
        }
        if(this.chassis.descFull.match('2*1GbE LAN')) {
            confName.push('2*1GbE LAN')
        }
        confName.push('1G dedicated RJ45 IPMI, Rails')
        confName.push(this.service ? this.service.name : 'Техническая поддержка Base 8х5, 36 месяцев')
        if (this.brokenStorageService) {
            confName.push('Невозврат неисправных накопителей')
        }
        return confName.join(', ');
    })

schema.virtual('partsSorted')
    .get(function () {
        if (!this.parts) return []
        const x = this.parts.sort((a: any, b: any) => {
            if (a.component?.basketOrder < b.component?.basketOrder) return -1
            if (a.component?.basketOrder > b.component?.basketOrder) return 1
            return 0
        })
        return x
    })

schema.virtual('date')
    .get(function () {
        return moment(this.createdAt).format('YYYY-MM-DD HH:mm');
    })

schema.virtual('storagePrice')
    .get(function () {
        return this.parts.filter((p: IPart) => ['HDD', 'SSD 2.5', 'SSD m.2', 'SSD U.2 NVMe'].includes(p.component?.type)).reduce((a, b) => a + b.price, 0) * 0.2;
    })

schema.virtual('priceService')
    .get(function () {
        return (this.priceComponents * (this.service ? this.service.coefficient : 0))
    })

schema.virtual('priceComponents')
    .get(function () {
        let sum = this.chassis?.price || 0
        /*if(this.id==='63bfc4ffd1cce654f6dc8bbf' || this.id==='63d785d63391d3174830905d') {
            console.log(this.parts.length)
        }*/
        for (const item of this.parts) {
            sum += item.price
        }
        return sum;
    })

schema.virtual('price')
    .get(function () {
        return this.priceComponents //+ (this.brokenStorageService ? this.storagePrice : 0)
    })

schema.virtual('priceTotal')
    .get(function () {
        return (this.price+this.priceService+(this.brokenStorageService ? this.storagePrice : 0)) * this.count
    })

schema.virtual('isRearBayNeeded')
    .get(function () {
        return this.rearBayCount < this.rearBaysNeeded
    })

schema.virtual('ssdM2Count')
    .get(function () {
        return this.parts.filter(p => p.component?.type === 'SSD m.2').reduce((a, b) => a + b.count, 0)
    })

schema.virtual('M2expnvmeCount')
    .get(function () {
        return this.parts.filter(p => p.component?.partNumber === 'M2expnvme').reduce((a, b) => a + b.count, 0)
    })
schema.virtual('M2RaidCount')
    .get(function () {
        return this.parts.filter(p => p.component?.partNumber === 'M2Raid').reduce((a, b) => a + b.count, 0)
    })
schema.virtual('U2expnvmeCount')
    .get(function () {
        return this.parts.filter(p => p.component?.partNumber === 'U2expnvme').reduce((a, b) => a + b.count, 0)
    })

schema.virtual('anybayCount')
    .get(function () {
        return this.parts.filter(p => p.component?.type === 'Backplane' && p.component?.description.match('AnyBay')).reduce((a, b) => a + b.count, 0)
    })

schema.virtual('rearBayNeeded')
    .get(function () {
        const needs = [0, 0, 1, 2, 2];
        return needs[this.nvmeCount]
    })

schema.virtual('memCount')
    .get(function () {
        return this.parts.filter(p => p.component?.category === 'Memory').reduce((a, b) => a + b.count, 0)
    })

schema.virtual('raidTrimodeCount')
    .get(function () {
        return this.parts.filter(p => p.component?.partNumber === '94008IR').reduce((a, b) => a + b.count, 0)
    })

schema.virtual('additionalNvmeDisksByBackplane')
    .get(function () {
        const backplaneCanAddDisks = this.parts.find(p => ['bplnab2u', 'bplnab1u'].includes(p.component?.partNumber))
        if (!backplaneCanAddDisks) return 0;
        //Искусственное ограничение от Бондаренко П.
        return 8
        //return this.chassis.units === 1 ? 10 : 8;
    })

schema.virtual('raid8iCount')
    .get(function () {
        return this.parts.filter(p => p.component?.type === 'RAID' && p.component?.partNumber.match('8I')).reduce((a, b) => a + b.count, 0)
    })

schema.virtual('raidTrimode8iCount')
    .get(function () {
        return this.parts.filter(p => p.component?.type === 'RAID' && p.component?.partNumber.match('8I')).reduce((a, b) => a + b.count, 0)
    })

schema.virtual('raidTrimode16iCount')
    .get(function () {
        return this.parts.filter(p => p.component?.type === 'RAID' && p.component?.partNumber.match('16I')).reduce((a, b) => a + b.count, 0)
    })

schema.virtual('sasRaidCount')
    .get(function () {
        return this.parts.filter(p => p.component?.type === 'RAID' && p.component?.description.match('SAS')).reduce((a, b) => a + b.count, 0)
    })
schema.virtual('sasDiskCount')
    .get(function () {
        return this.parts.filter(p => p.component?.isDiskSAS).reduce((a, b) => a + b.count, 0)
    })
schema.virtual('sataDiskCount')
    .get(function () {
        return this.parts.filter(p => p.component?.isDiskSATA).reduce((a, b) => a + b.count, 0)
    })
schema.virtual('sataM2DiskCount')
    .get(function () {
        return this.parts.filter(p => p.component?.isDiskM2SATA).reduce((a, b) => a + b.count, 0)
    })
schema.virtual('nvmeM2DiskCount')
    .get(function () {
        return this.parts.filter(p => p.component?.isDiskM2NVME).reduce((a, b) => a + b.count, 0)
    })
schema.virtual('sffDiskCount')
    .get(function () {
        return this.parts.filter(p => p.component?.category === 'HDD' && p.component?.isSFF).reduce((a, b) => a + b.count, 0)
    })
schema.virtual('lffDiskCount')
    .get(function () {
        return this.parts.filter(p => p.component?.category === 'HDD' && p.component?.isLFF).reduce((a, b) => a + b.count, 0)
    })
schema.virtual('sasRearBayCount')
    .get(function () {
        return this.parts.filter(p => p.component?.isRearBaySAS).reduce((a, b) => a + b.count, 0)
    })
schema.virtual('nvmeRearBayCount')
    .get(function () {
        return this.parts.filter(p => p.component?.isRearBayNVMe).reduce((a, b) => a + b.count, 0)
    })

schema.virtual('cable8643Count')
    .get(function () {
        return this.parts.filter(p => p.component?.type === 'Cable' && p.component?.partNumber.match('8643')).reduce((a, b) => a + b.count, 0)
    })

schema.virtual('cableSataCount')
    .get(function () {
        return this.parts.filter(p => p.component?.type === 'Cable' && p.component?.partNumber === 'SATA-SATA').reduce((a, b) => a + b.count, 0)
    })

schema.virtual('hbaCount')
    .get(function () {
        return this.parts
            .filter(p => p.component?.type === 'RAID' && p.component?.partNumber.match('HBA'))
            .filter(p => p.component?.partNumber !== '93008EHBA')
            .reduce((a, b) => a + b.count, 0)
    })

schema.virtual('raid93Count')
    .get(function () {
        return this.parts.filter(p => p.component?.type === 'RAID'
            && p.component?.partNumber.match('93')
            && p.component?.description.match(/(\d)GB/)
        ).reduce((a, b) => a + b.count, 0)
    })

schema.virtual('cacheModule93Count')
    .get(function () {
        return this.parts.filter(p => p.component?.type === 'RAID' && p.component?.partNumber === 'CVM02').reduce((a, b) => a + b.count, 0)
    })

schema.virtual('raid94Count')
    .get(function () {
        return this.parts.filter(p =>
            p.component?.type === 'RAID'
            && p.component?.partNumber.match(/94|95/)
            && p.component?.description.match(/(\d)GB/)
        )
            .reduce((a, b) => a + b.count, 0)
    })

schema.virtual('cacheModule94Count')
    .get(function () {
        return this.parts.filter(p => p.component?.type === 'RAID' && p.component?.partNumber === 'CVPM05').reduce((a, b) => a + b.count, 0)
    })

schema.virtual('memModuleSize')
    .get(function () {
        const module = this.parts.find(p => p.component?.category === 'Memory')
        if (module) return module.component?.memorySize
    })

schema.virtual('memMaxCount')
    .get(function () {
        if (['G3', 'G3R', 'G4'].includes(this.chassis.platform)) {
            return this.cpuCount > 1 ? 32 : 16
        }
        return this.chassis.cpu === 'AMD' ? 32 : 24
    })

schema.virtual('cpuCount')
    .get(function () {
        return this.parts.filter(p => p.component?.category === 'CPU').reduce((a, b) => a + b.count, 0)
    })
schema.virtual('m2raidCount')
    .get(function () {
        return this.parts.filter(p => p.component?.partNumber === 'M2Raid').reduce((a, b) => a + b.count, 0)
    })

schema.virtual('ocpCount')
    .get(function () {
        return this.parts.filter(p => p.component?.type === 'LAN OCP 3.0').reduce((a, b) => a + b.count, 0)
    })

schema.virtual('gpuCount')
    .get(function () {
        return this.parts.filter(p => p.component?.type === 'GPU').reduce((a, b) => a + b.count, 0)
    })

schema.virtual('lanCount')
    .get(function () {
        return this.parts.filter(p => p.component?.type === 'LAN').reduce((a, b) => a + b.count, 0)
    })

schema.virtual('lanPortsCount')
    .get(function () {
        return this.parts.filter(p => p.component?.type === 'LAN' || p.component?.type === 'LAN OCP 3.0').reduce((a, b) => a + b.component?.lanPorts * b.count, 0)
    })

schema.virtual('lanCount100')
    .get(function () {
        return this.parts.filter(p => p.component?.type === 'LAN' && p.component?.lanSpeed === 100).reduce((a, b) => a + b.count, 0)
    })

schema.virtual('sfpCount')
    .get(function () {
        return this.parts.filter(p => p.component?.type === 'Transceiver' && p.component?.description.match('SFP')).reduce((a, b) => a + b.count, 0)
    })

schema.virtual('cableCount')
    .get(function () {
        return this.parts.filter(p => p.component?.type === 'Transceiver' && p.component?.partNumber.match('CAB')).reduce((a, b) => a + b.count, 0)
    })

schema.virtual('transceiverCount')
    .get(function () {
        return this.parts.filter(p => p.component?.type === 'Transceiver').reduce((a, b) => a + b.count, 0)
    })

schema.virtual('cable4U2Count')
    .get(function () {
        return this.parts.filter(p => p.component?.partNumber === '1*SFF-8643 - 1*SFF-8643').reduce((a, b) => a + b.count, 0)
    })

schema.virtual('ssdU2Count')
    .get(function () {
        return this.parts.filter(p => p.component?.type === 'SSD U.2 NVMe').reduce((a, b) => a + b.count, 0)
    })

schema.virtual('raidCount')
    .get(function () {
        return this.parts.filter(p => !['M2expnvme', 'U2expnvme', 'M2Raid', '93008EHBA'].includes(p.component?.partNumber) && p.component?.type === 'RAID' && !p.component?.description.match('Модуль')).reduce((a, b) => a + b.count, 0)
    })

schema.virtual('cacheModuleCount')
    .get(function () {
        return this.parts.filter(p => p.component?.type === 'RAID' && ['CVM02', 'CVPM05'].includes(p.component?.partNumber)).reduce((a, b) => a + b.count, 0)
    })

schema.virtual('vrocModuleCount')
    .get(function () {
        return this.parts.filter(p => p.component?.type === 'RAID' && ['VROCSTNMOD', 'VROCPREMOD'].includes(p.component?.partNumber)).reduce((a, b) => a + b.count, 0)
    })

schema.virtual('fcCount')
    .get(function () {
        return this.parts.filter(p => p.component?.type === 'FC').reduce((a, b) => a + b.count, 0)
    })

schema.virtual('nvmeCount')
    .get(function () {
        return this.parts.filter(p => p.component?.type === 'SSD U.2 NVMe').reduce((a, b) => a + b.count, 0)
    })

schema.virtual('rearBayCount')
    .get(function () {
        return this.parts.filter(p => p.component?.type === 'Rear bay').reduce((a, b) => a + b.count, 0)
    })

schema.virtual('rearBayNotNVMeSFFCount')
    .get(function () {
        return this.parts.filter(p => p.component?.type === 'Rear bay' && !p.component?.description.match('NVMe') && p.component?.partNumber.match('SFF')).reduce((a, b) => a + b.count, 0)
    })

schema.virtual('rearBaySasSataCount')
    .get(function () {
        return this.parts.filter(p => p.component?.type === 'Rear bay' && p.component?.partNumber.match('SAS')).reduce((a, b) => a + b.count, 0)
    })

schema.virtual('rearBayAllSFFCount')
    .get(function () {
        return this.parts.filter(p => p.component?.type === 'Rear bay' && p.component?.partNumber.match('SFF')).reduce((a, b) => a + b.count, 0)
    })

schema.virtual('rearBayLFFCount')
    .get(function () {
        return this.parts.filter(p => p.component?.type === 'Rear bay' && !p.component?.description.match('NVMe') && p.component?.partNumber.match('LFF')).reduce((a, b) => a + b.count, 0)
    })

schema.virtual('diskLFFCount')
    .get(function () {
        return this.parts.filter(p => p.component?.type === 'HDD' && p.component?.isLFF).reduce((a, b) => a + b.count, 0)
    })

schema.virtual('diskSFFCount')
    .get(function () {
        return this.parts.filter(p => p.component?.type === 'HDD' && p.component?.isSFF).reduce((a, b) => a + b.count, 0)
    })


schema.virtual('rearBayU2Count')
    .get(function () {
        return this.parts.filter(p => p.component?.partNumber === 'rbaySFFU2').reduce((a, b) => a + b.count, 0)
    })

schema.virtual('diskCount')
    .get(function () {
        return this.parts.filter(p => ['HDD', 'SSD 2.5', 'SSD U.2 NVMe'].includes(p.component?.type)).reduce((a, b) => a + b.count * 1, 0)
    })

schema.virtual('diskSsdHddCount')
    .get(function () {
        return this.parts.filter(p => ['HDD', 'SSD 2.5'].includes(p.component?.type)).reduce((a, b) => a + b.count * 1, 0)
    })
schema.virtual('diskSsd25Count')
    .get(function () {
        return this.parts.filter(p => ['SSD 2.5'].includes(p.component?.type)).reduce((a, b) => a + b.count * 1, 0)
    })

schema.virtual('trimod16ICount')
    .get(function () {
        return this.parts.filter(p => p.component?.description.match('16i') && p.component?.description.match('Trimode')).reduce((a, b) => a + b.count, 0)
    })

schema.virtual('raid16ICount')
    .get(function () {
        return this.parts.filter(p => p.component?.description.match('16i')).reduce((a, b) => a + b.count, 0)
    })

schema.virtual('powerCoefficient')
    .get(function () {
        if (!this.power) return 0
        return this.powerConsumption / this.power * 100
    })

schema.virtual('powerConsumption')
    .get(function () {
        return this.parts.filter(p => p.component?.category !== 'Power').reduce((a, b) => a + b.component?.powerConsumption * b.count, 0)
    })

schema.virtual('power')
    .get(function () {
        return this.parts.filter(p => p.component?.category === 'Power').reduce((a, b) => a + b.component?.power, 0)
    })

schema.virtual('powerCount')
    .get(function () {
        return this.parts.filter(p => p.component?.category === 'Power').reduce((a, b) => a + b.count, 0)
    })
schema.virtual('cablesCount')
    .get(function () {
        return this.parts.filter(p => p.component?.category === 'Cables').reduce((a, b) => a + b.count, 0)
    })

schema.virtual('backplaneCount')
    .get(function () {
        return this.parts.filter(p => p.component?.type === 'Backplane').reduce((a, b) => a + b.count, 0)
    })

schema.virtual('pcieCount')
    .get(function () {
        return this.parts
            .filter(p => (p.component?.category === 'PCI-E'
                && !['LAN OCP 3.0', 'Transceiver'].includes(p.component?.type))
                || (p.component?.type === 'SSD NVMe PCI-E')
                || (p.component?.type === 'RAID' && !p.component?.description.match('Модуль'))
            )
            .reduce((a, b) => a + (b.component?.partNumber === 'RTXA20006' ? b.count * 2 : b.count), 0)
    })

schema.virtual('pcieMaxCount')
    .get(function () {
        if (this.chassis.partNumber === 'QSRV-181000') return this.cpuCount > 1 ? 5 : 3
        if (this.chassis.partNumber === 'QSRV-463612-E-R') return this.cpuCount > 1 ? 5 : 3
        if (this.chassis.partNumber === 'QSRV-262412-E-R') return this.cpuCount > 1 ? 5 : 3
        if (this.chassis.partNumber.match('-P-R') && this.chassis.units === 2) return this.cpuCount > 1 ? 8 : 3
        if (this.chassis.partNumber.match('-E-R') && this.chassis.units === 2) return this.cpuCount > 1 ? 6 : 3
        return this.parts.filter(p => p.component?.category === 'Riser').reduce((a, b) => a + b.component?.riserSlots * b.count, 0) - this.anybayCount
    })


schema.virtual('riserPort12Count')
    .get(function () {
        return this.parts.filter(p => p.component?.category === 'Riser' && p.component?.description.match('port 1/2')).reduce((a, b) => a + b.count, 0)
    })

schema.virtual('riserPort3Count')
    .get(function () {
        return this.parts.filter(p => p.component?.category === 'Riser' && p.component?.descFull.match('port 3')).reduce((a, b) => a + b.count, 0)
    })

schema.virtual('riserPort4Count')
    .get(function () {
        return this.parts.filter(p => p.component?.category === 'Riser' && p.component?.description.match('port 4')).reduce((a, b) => a + b.count, 0)
    })

schema.virtual('riserMaxCount')
    .get(function () {
        return this.chassis.units * 2;
    })

schema.virtual('risersAvailable')
    .get(function () {
        return this.riserMaxCount - this.rearBayCount;
    })

schema.virtual('cpuMaxCount')
    .get(function () {
        return 2;
    })

schema.virtual('riserX16Count')
    .get(function () {
        return this.parts.filter(p => p.component?.riserIsX16).reduce((a, b) => a + b.count, 0)
    })

schema.virtual('lan100GBCount')
    .get(function () {
        return this.parts.filter(p => p.component?.type === 'LAN' && p.component?.description.match('100Gb')).reduce((a, b) => a + b.count, 0)
    })

schema.virtual('riserPortsAvailable')
    .get(function () {
        return this.parts.filter(p => p.component?.category === 'Riser').reduce((a, b) => a + b.component?.riserPortsOnBoard, 0)
    })

schema.virtual('riserPorts')
    .get(function () {
        return this.parts.filter(p => p.component?.category === 'Riser').map(p => p.component?.riserForPort)
    })

schema.virtual('riserCount')
    .get(function () {
        return this.parts.filter(p => p.component?.category === 'Riser').reduce((a, b) => a + b.count, 0)
    })

schema.virtual('parts', {
    ref: 'part',
    localField: '_id',
    foreignField: 'configuration'
})
export const Conf = mongoose.model<IConf, IConfModel>(model, schema)
