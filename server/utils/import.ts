import XLSX from 'xlsx'

//Парсинг файла менеджеров
export async function parseManagers(file:any) {
    const workbook = XLSX.read(file, {type:'buffer'});
    const sheet_name_list = workbook.SheetNames;
    const itemsFull = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {header: 1}) as any[]
    const items = itemsFull.filter((i:any) => !!i[0])
    await Manager.updateMany({},{deleted: true})
    for (const item of items) {
        await Manager.updateOne({name: item[0]}, {
            name: item[0],
            title: item[1],
            phoneIn: item[2],
            phone: item[3],
            email: item[4],
            dep: item[5],
            deleted: false
        }, {upsert: true});
    }
    return `Менеджеры: ${items.length}`
}

//Парсинг файла соответствия транссиверов
export async function parseNetTrans(file:any) {
    const workbook = XLSX.read(file, {type:'buffer'});
    const sheet_name_list = workbook.SheetNames;
    const items = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {header: 1}) as any[]
    const commutators = items[0].filter((c:any) => c.match('QSW')).map((i:any) => i.replace('Серия ', ''))
    //console.log(commutators)
    for (const commutator of commutators) {
        const devices = await Device.find({name: {$regex: commutator}})
        for (const device of devices) {
            let index = -1
            for (const name of commutators) {
                if (device.name.match(name)) {
                    index = commutators.indexOf(name) + 4
                    break
                }
            }
            device.trans = []
            for (let i = 1; i < items.length; i++) {
                const trans = items[i]
                if (trans[index] && trans[index] !== 'x') {
                    const transDevice = await Device.findOne({name: trans[1]}) as IDevice
                    device.trans.push(transDevice)
                }
            }
            await device.save()
        }
    }
    return `Коммутаторов: ${commutators.length}. Трансиверов: ${items.length - 1}`
}

//Парсинг файла сетевых сервисов
export async function parseNetServices(items:any[]) {
    items.shift()
    await NetService.updateMany({}, {deleted: true})
    let count = 0
    for (const item of items) {
        const device = await Device.findOne({name: item[2]});
        if (item[5]) {
            await NetService.updateOne({name: item[3]}, {
                deleted: false,
                device,
                description: item[4],
                price: item[5],
                level: item[6],
                period: item[7]
            }, {upsert: true})
            count++
        }
    }
    return count
}

//Парсинг файла сетевого
export async function parseNetworkXLS(file:any) {
    let category, subcategory, count = 0

    const workbook = XLSX.read(file, {type:'buffer'});
    const sheet_name_list = workbook.SheetNames;
    const items = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {header: 1}) as any[]
    //return {x: 1}
    items.shift()
    await Device.updateMany({}, {deleted: true})
    await Category.updateMany({}, {deleted: true})
    await SubCategory.updateMany({}, {deleted: true})
    for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const itemNext = items[i + 1]
        if (item && itemNext && !item[2] && !itemNext[2]) {
            category = await Category.findOne({name: item[0]})
            if (!category) category = await Category.create({name: item[0]})
            category.deleted = false
            await category.save()
        } else if (!item[2]) {
            if (item[0] && !item[0].match('EOS')) {
                subcategory = await SubCategory.findOne({name: item[0], category})
                if (!subcategory) subcategory = await SubCategory.create({name: item[0], category})
                subcategory.deleted = false
                await subcategory.save()
            } else {
                subcategory = 0
            }
        } else {
            if (!(item[0] + ' ').match('EOS') && subcategory) {
                const model = {
                    torp: !!(item[0] + ' ').match('ТОРП'),
                    deleted: false,
                    name: item[2],
                    status: item[0],
                    description: item[3],
                    price: item[4],
                    subcategory,
                    discount1: item[6],
                    discount2: item[8],
                    discount3: item[10],
                    powerNames: item[11]?.split(',').map((i:any) => i.trim()) || [],
                    powerCount: item[12] || 0
                }

                if(model.name === 'QSW-3750-10T-AC-R'){
                    //console.log(item)
                    //console.log(model)
                }
                await Device.updateOne({name: model.name}, {deleted: true}, {upsert: true})
                const update = await Device.updateOne({name: model.name}, model, {upsert: true})
                    //.catch(e=>console.log(e.message))
                if(update.modifiedCount) {
                    count++
                }
            }
        }
    }
    const devicesWithPower = await Device.find({powerCount: {$gt: 0}})
    for (const device of devicesWithPower) {
        const powers = await Device.find({name: {$in: device.powerNames}})
        for (const power of powers) {
            power.isPower = true
            await power.save()
        }
        device.powers = [...new Set(powers)]
        await device.save()
    }
    const serviceCount = await parseNetServices(XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[1]], {header: 1}))
    return `Сетевое оборудование: ${count}. Сервисы: ${serviceCount}`
}

//db.device.findOne({name:'QSW-3750-10T-AC-R'}).then(console.log)
//Парсинг файла сервисов
export async function parseServiceXLS(file:any) {
    const workbook = XLSX.read(file, {type:'buffer'});
    const sheet_name_list = workbook.SheetNames;
    const items = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]])
    const pnArray = items.map((i:any) => i['Артикул сервиса'])
    const notExist = await Service.find({article: {$nin: pnArray}})
    const x = await Service.deleteMany({_id: {$in: notExist.map(c => c._id)}})
    //await db.component.deleteMany({_id:{$in:notExist.map(c=>c._id)}})

    let count = 0;
    for (const item of items as any) {
        const data = {
            partNumber: item['Артикул продукта'],
            article: item['Артикул сервиса'],
            name: item['Наименование сервиса'],
            price: item['Цена'],
            priceNet: item['Цена_NET'],
            priceDdp: item['цена DDP, $'],
            priceFob: item['цена FOB, $'],
            discount1: item['Скидка_1'],
            discount2: item['Скидка_2'],
            level: item['Уровень сервиса'],
            period: item['Срок'].replace('Y', ''),
            coefficient: item['Коэф'],
        }
        try {
            await Service.updateOne({article: data.article}, data, {upsert: true})
            count++;
        } catch (e) {
        }
    }
    return 'Сервисы: ' + count
}

//db.chassis.find({platform:'G2'}).then(console.log)
//Парсинг файла номенклатуры
export async function parseComponentXLS(file:any) {
    try {
        const platformNames = [
            'G2',
            'G3',
            'G2R',
            'G3R',
            'AMD',
            'JBOD',
            'G4',
            'Adisk'
        ]
        const workbook = XLSX.read(file, {type:'buffer'});
        const sheet_name_list = workbook.SheetNames;
        const items = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]])
        let chassis = 0;
        let components = 0;
        await Component.updateMany({}, {deleted: true})
        await Chassis.updateMany({}, {deleted: true})

        for (const item of items as any) {
            if(item.Disabled) continue
            const platforms = []
            if(item.PN?.trim() ==='P8458P') {
                console.log(item)
            }
            for (const key of Object.keys(item)) {
                if (platformNames.includes(key)) {
                    platforms.push(key)
                }
                item.platforms = platforms;
            }
            const fields = {
                type: item.Type?.trim(),
                price: item['цена GPL, $'],
                priceDdp: item['цена DDP, $'],
                priceFob: item['цена FOB, $'],
                category: item.Family?.trim(),
                name: item.Name?.trim(),
                params: item.Description?.trim(),
                partNumber: item.PN?.trim(),
                powerConsumption: item.Power,
                descFull: item.DescFull?.trim(),
                unitFix: item.UnitFixed || 0,
                unitMin: item.UnitMin || 0,
                deleted: false,
                platforms,
            }

            if (!fields.partNumber) continue
            if (!fields.descFull) fields.descFull = fields.params
            if (fields.category === 'Chassis') {
                chassis++
                const data = chassisData(fields)

                const x= await Chassis.updateOne({partNumber: data.partNumber}, data, {upsert: true})
            } else {
                components++
                const data = componentData(fields)
                const x = await Component.updateOne({partNumber: data.partNumber}, data, {upsert: true})
            }
        }
        return `Шасси: ${chassis}. Компоненты: ${components}`
    } catch (e) {
        console.error(e)
    }
}

//Адаптация данных шасси
function chassisData(data:any) {
    data.platform = data.platforms.join(',')
    data.disksFormFactor = data.type
    return data
}

//Адаптация данных компонента
function componentData(data:any) {
    if (data.type === 'SSD') {
        if (data.params.match('M.2')) {
            data.type = 'SSD m.2'
        } else if (data.params.match('U.2')) {
            data.type = 'SSD U.2 NVMe'
        } else if (data.descFull.match('NVMe')) {
            console.log(data)
            data.type = 'SSD NVMe PCI-E'
        } else {
            data.type = 'SSD 2.5'
        }
    } else if (data.type && data.type.match('RAID')) {
        data.type = 'RAID'
    } else if (data.category === 'PSU') {
        data.category = 'Power'
    } else if (data.type === 'Cable for backplane') {
        data.type = 'Cable'
    }
    return data
}