import Excel from "exceljs";
import logic from "~/plugins/logic/logic-validator"
import FillPattern from "exceljs/index";

export function servSpec(worksheet:Excel.Worksheet, spec:ISpec, confidential:boolean, user:IUser, course: number) {
    const currName = confidential ? '$' : user.currency
    const numFmt = `_(* #,##0.00_)"${currName === 'Рубли' ? 'Р' : '$'}";_(* (#,##0.00);_(* "-"??_);_(@_)`

    const data = [
        "АРТИКУЛ",
        "НАИМЕНОВАНИЕ",
        "КОЛ-ВО",
        "ЦЕНА РРЦ, " + currName,
        "СТОИМОСТЬ РРЦ, " + currName,

    ]
    if (user.isEmployer) {
        data.push("СКИДКА, %",
            "ЦЕНА СО СКИДКОЙ, " + currName,
            "СТОИМОСТЬ СО СКИДКОЙ, " + currName)
    }
    if (confidential) {
        data.push('ЦЕНА FOB, $')
        data.push('ЦЕНА DDP, $')
        data.push('СТОИМОСТЬ DDP, $')
    }
    const redRow = worksheet.addRow(data)
    redRow.fill = {type: 'pattern', pattern: 'solid', bgColor: {argb: 'FFFF2238'}, fgColor: {argb: 'FFFF2238'}}
    redRow.font = {color: {argb: 'FFFFFFFF'}, name: 'Arial'}
    redRow.height = 30
    redRow.alignment = {vertical: 'middle'}
    const fill = {type: 'pattern', pattern: 'solid', bgColor: {argb: 'FFCCCC00'}, fgColor: {argb: 'FFCCCC00'}}

    const summaryRows = []
    for (const conf of spec.configurations) {
        const confRow = worksheet.addRow(['', conf.name])
        confRow.height = 30
        confRow.alignment = {vertical: 'middle'}
        if(confidential) {
            confRow.getCell(9).fill = fill
            confRow.getCell(10).fill = fill
            confRow.getCell(11).fill = fill
        }

        const {errors} = logic(conf)
        if (errors.length) {
            const errRow = worksheet.addRow(['', 'В конфигурации есть ошибки'])
            const cell = errRow.getCell(2)
            cell.style = {font: {color: {argb: 'FFFF0000'}, bold: true}}
        }
        const data = [
            conf.chassis.partNumber,
            conf.description,
            conf.count,
            conf.price * (user.currency === 'USD' ? 1 : course),
            conf.priceTotal * (confidential || user.currency === 'USD' ? 1 : course),
            0,
            conf.price * (confidential || user.currency === 'USD' ? 1 : course),
            conf.priceTotal * (confidential || user.currency === 'USD' ? 1 : course),
        ]
        const rowSummary = worksheet.addRow(data)
        summaryRows.push(rowSummary.number)
        rowSummary.height = 50
        rowSummary.getCell(5).value = {formula: `C${rowSummary.number} * D${rowSummary.number}`}
        if (user.isEmployer) {
            rowSummary.getCell(7).value = {formula: `D${rowSummary.number} - D${rowSummary.number} * F${rowSummary.number}`}
            rowSummary.getCell(6).style = {numFmt: '0%'}
            rowSummary.getCell(8).value = {formula: `G${rowSummary.number} * C${rowSummary.number}`}
            if(confidential) {
                rowSummary.getCell(9).fill = fill
                rowSummary.getCell(10).fill = fill
                rowSummary.getCell(11).fill = fill
            }
        }

        rowSummary.alignment = {wrapText: true, vertical: 'middle'}
        //rowSummary.getCell(2).alignment = {horizontal: 'center', vertical: 'middle'}
        rowSummary.height = 50
        //rowSummary.getCell(3).font = {size: 8}

        const gray = 'FFAAAAAA'
        const chassisRow = worksheet.addRow([conf.chassis.partNumber, conf.chassis.descFull, 1, 0])
        chassisRow.height = 30
        chassisRow.font = {color: {argb: gray}}
        chassisRow.alignment = {wrapText: true}
        chassisRow.getCell(1).alignment = {horizontal: 'right'}
        if (confidential) {
            rowSummary.getCell(11).value = {formula: `J${rowSummary.number}*C${rowSummary.number}`}
            chassisRow.getCell(9).value = Math.round((conf.chassis.priceFob) * 100) / 100
            chassisRow.getCell(9).fill = fill
            chassisRow.getCell(10).fill = fill
            chassisRow.getCell(11).fill = fill
            chassisRow.getCell(10).value = Math.round((conf.chassis.priceDdp) * 100) / 100
            chassisRow.getCell(4).value = {formula: `J${chassisRow.number}/0.85/0.4`}
            chassisRow.getCell(4).font = {color: {argb: gray}}
        }
        let fob = conf.chassis.price
        const partRowNumbers = [chassisRow.number]
        const storageRows = []
        for (const part of conf.partsSorted) {
            if (true || user.email.match('qtech.ru') || user.email.match('tdtel.ru') || user.email.match('abrikoz@gmail.com')) {
                const data = [
                    part.component.partNumber,
                    part.component.description,
                    part.count,
                    0,
                ]
                if (confidential) {
                    data.push('')
                    data.push('')
                    data.push('')
                    data.push('')
                    data.push(Math.round((part.component.priceFob) * 100) / 100)
                    data.push(Math.round((part.component.priceDdp) * 100) / 100)
                    fob += part.component.price * part.count
                }
                const partRow = worksheet.addRow(data)
                if (['HDD', 'SSD 2.5', 'SSD m.2', 'SSD U.2 NVMe'].includes(part.component.type)) {
                    storageRows.push(partRow.number)
                }
                partRowNumbers.push(partRow.number)
                partRow.alignment = {wrapText: true}
                partRow.font = {color: {argb: gray}}
                partRow.getCell(1).alignment = {horizontal: 'right'}
                if(confidential) {
                    partRow.getCell(9).fill = fill
                    partRow.getCell(10).fill = fill
                    partRow.getCell(11).fill = fill
                }
                //partRow.getCell(2).alignment = {horizontal: 'center'}
                if (confidential) {
                    partRow.getCell(5).value = {formula: `C${partRow.number}*D${partRow.number}`}
                    partRow.getCell(4).value = {formula: `J${partRow.number}/0.85/0.4`}
                    partRow.getCell(4).font = {color: {argb: gray}}
                    //partRow.getCell(10).value = {formula: `I${partRow.number} * B${partRow.number}`}
                }
            }
        }
        if (conf.service) {
            const data = [
                conf.service.article,
                conf.service.name,
                conf.count,
                conf.priceService * (confidential || user.currency === 'USD' ? 1 : course),
                conf.priceService * conf.count * (confidential || user.currency === 'USD' ? 1 : course),
                0,

            ]
            const serviceRow = worksheet.addRow(data)
            serviceRow.getCell(4).value = {formula: `J${serviceRow.number}/0.85/0.4`}
            serviceRow.getCell(5).value = {formula: `C${serviceRow.number}*D${serviceRow.number}`}
            serviceRow.getCell(7).value = {formula: `D${serviceRow.number}-D${serviceRow.number}*F${serviceRow.number}`}
            serviceRow.getCell(8).value = {formula: `G${serviceRow.number}*C${serviceRow.number}`}
            const servicePercent = conf.service.name.match('Base') ? 0:  (conf.service.name.match('36 месяцев') ? 0.1 : 0.15)
            if(confidential) {
                serviceRow.getCell(10).value = {formula: `J${rowSummary.number}*0.3`}
                serviceRow.getCell(11).value = {formula: `H${serviceRow.number}*C${serviceRow.number}`}
                serviceRow.getCell(9).fill = fill
                serviceRow.getCell(10).fill = fill
                serviceRow.getCell(11).fill = fill
            }
            summaryRows.push(serviceRow.number)
        }

        if (conf.brokenStorageService && storageRows.length) {
            let formula = []
            for (const num of storageRows) {
                formula.push(`E${num}*0.2`)
            }
            const data = [
                'NRD',
                'Невозврат неисправных накопителей',
                conf.count,
                confidential ? {formula: formula.join('+')} : conf.storagePrice * (confidential || user.currency === 'USD' ? 1 : course),
            ]
            const serviceRow = worksheet.addRow(data)
            serviceRow.getCell(5).value = {formula: `C${serviceRow.number}*D${serviceRow.number}`}
            summaryRows.push(serviceRow.number)
        }

        if (confidential) {
            rowSummary.getCell(4).value = {formula: `SUMPRODUCT(C${partRowNumbers[0]}:C${partRowNumbers[partRowNumbers.length - 1]},D${partRowNumbers[0]}:D${partRowNumbers[partRowNumbers.length - 1]})`}
            rowSummary.getCell(4).alignment = {vertical: 'middle'}
            rowSummary.getCell(10).value = {formula: `SUMPRODUCT(C${partRowNumbers[0]}:C${partRowNumbers[partRowNumbers.length - 1]},J${partRowNumbers[0]}:J${partRowNumbers[partRowNumbers.length - 1]})`}
        }
    }
    let formula = []
    let formula2 = []
    let formula3 = []
    for (const row of summaryRows) {
        formula.push(`H${row}`)
        formula2.push(`K${row}`)
        formula3.push(`E${row}`)
    }
    const sumServ = worksheet.addRow(['', 'Итого вкл. НДС 20%. ' + (confidential ? '$' : user.currency)])

    sumServ.getCell(5).value = {formula: formula3.join('+')}
    sumServ.getCell(8).value = {formula: formula.join('+')}
    //sumServ.getCell(8).style = {numFmt}
    sumServ.getCell(11).value = {formula: formula2.join('+')}
    //sumServ.getCell(11).style = {numFmt}
    sumServ.fill = {type: 'pattern', pattern: 'solid', bgColor: {argb: 'DDDDDDDD'}, fgColor: {argb: 'DDDDDDDD'}}
    sumServ.height = 20
    return sumServ.number
}