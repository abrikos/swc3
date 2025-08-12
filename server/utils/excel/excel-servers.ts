import Excel from "exceljs";
import logic from "~/plugins/logic/logic-validator"
import FillPattern from "exceljs/index";

export function servSpec(worksheet: Excel.Worksheet, spec: ISpec, confidential: boolean, user: IUser, course: number) {
    const currName = confidential ? '$' : user.currency
    const numFmt = `_(* #,##0.00_)"${currName === 'Рубли' ? 'Р' : '$'}"`

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
        data.push('')
        data.push('ЦЕНА FOB, $')
        data.push('ЦЕНА DDP, $')
        data.push('СТОИМОСТЬ DDP, $')
    }
    const redRow = worksheet.addRow(data)
    redRow.height = 40
    redRow.alignment = {vertical: 'middle'}
    for (let i = 1; i <= (confidential ? 12 : 9); i++) {
        if(i===9) continue
        redRow.getCell(i).style = {
            fill: {type: 'pattern', pattern: 'solid', bgColor: {argb: 'FFFF2238'}, fgColor: {argb: 'FFFF2238'}},
            font: {color: {argb: 'FFFFFFFF'}, name: 'Arial'},
            alignment: {vertical: 'middle', horizontal: 'center', wrapText: true}
        }
    }
    const fill = {
        type: 'pattern',
        pattern: 'solid',
        bgColor: {argb: 'FFFFFF00'},
        fgColor: {argb: 'FFFFFF00'}
    } as FillPattern

    const summaryRows = []
    for (const conf of spec.configurations) {
        const confRow = worksheet.addRow(['', conf.name])
        confRow.height = 30
        confRow.alignment = {vertical: 'middle'}
        if (confidential) {
            confRow.getCell(10).style = {fill}
            confRow.getCell(11).fill = fill
            confRow.getCell(12).fill = fill
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
            {formula: '+F18'},
            conf.price * (confidential || user.currency === 'USD' ? 1 : course),
            conf.priceTotal * (confidential || user.currency === 'USD' ? 1 : course),
        ]
        const rowSummary = worksheet.addRow(data)
        summaryRows.push(rowSummary.number)
        //rowSummary.height = 170
        rowSummary.getCell(5).value = {formula: `C${rowSummary.number} * D${rowSummary.number}`}
        if (user.isEmployer) {
            rowSummary.getCell(7).value = {formula: `D${rowSummary.number} - D${rowSummary.number} * F${rowSummary.number}`}
            rowSummary.getCell(6).style = {numFmt: '0%'}
            rowSummary.getCell(8).value = {formula: `G${rowSummary.number} * C${rowSummary.number}`}
            if (confidential) {
                rowSummary.getCell(10).fill = fill
                rowSummary.getCell(11).fill = fill
                rowSummary.getCell(12).fill = fill
            }
        }

        rowSummary.alignment = {wrapText: true, vertical: 'middle'}
        rowSummary.getCell(2).alignment = {vertical: 'middle', wrapText: true}
        //rowSummary.height = 50
        //rowSummary.getCell(3).font = {size: 8}

        const gray = 'FFAAAAAA'
        const chassisRow = worksheet.addRow([conf.chassis.partNumber, conf.chassis.descFull, 1, 0])
        chassisRow.getCell(2).alignment = {vertical: 'middle', wrapText: true}
        chassisRow.font = {color: {argb: gray}}
        chassisRow.getCell(1).alignment = {vertical: 'middle', horizontal: 'right'}
        if (confidential) {
            rowSummary.getCell(12).value = {formula: `K${rowSummary.number}*C${rowSummary.number}`}
            chassisRow.getCell(10).value = Math.round((conf.chassis.priceFob) * 100) / 100
            chassisRow.getCell(10).fill = fill
            chassisRow.getCell(11).fill = fill
            chassisRow.getCell(12).fill = fill
            chassisRow.getCell(11).value = Math.round((conf.chassis.priceDdp) * 100) / 100
            chassisRow.getCell(4).value = {formula: `K${chassisRow.number}/0.85/0.4`}
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
                if (confidential) {
                    partRow.getCell(10).fill = fill
                    partRow.getCell(11).fill = fill
                    partRow.getCell(12).fill = fill
                }
                //partRow.getCell(2).alignment = {horizontal: 'center'}
                if (confidential) {
                    partRow.getCell(5).value = {formula: `C${partRow.number}*D${partRow.number}`}
                    partRow.getCell(4).value = {formula: `K${partRow.number}/0.85/0.4`}
                    partRow.getCell(4).font = {color: {argb: gray}}
                    //partRow.getCell(11).value = {formula: `I${partRow.number} * B${partRow.number}`}
                }
            }
        }
        if (conf.service) {
            const data = [
                `SUP-${conf.service.level}-${conf.service.period}Y-${conf.chassis.partNumber}`,
                conf.service.name,
                {formula: `+C${rowSummary.number}`},
                conf.priceService * (confidential || user.currency === 'USD' ? 1 : course),
                conf.priceService * conf.count * (confidential || user.currency === 'USD' ? 1 : course),
                {formula: '+F18'},

            ]
            const serviceRow = worksheet.addRow(data)
            serviceRow.getCell(4).value = confidential ? {formula: `D${rowSummary.number}*${conf.service.coefficient}`} : conf.price * (user.currency === 'USD' ? 1 : course) * conf.service.coefficient
            serviceRow.getCell(5).value = {formula: `C${serviceRow.number}*D${serviceRow.number}`}
            serviceRow.getCell(7).value = {formula: `D${serviceRow.number}-D${serviceRow.number}*F${serviceRow.number}`}
            serviceRow.getCell(8).value = {formula: `G${serviceRow.number}*C${serviceRow.number}`}
            const servicePercent = conf.service.name.match('Base') ? 0 : (conf.service.name.match('36 месяцев') ? 0.1 : 0.15)
            if (confidential) {
                serviceRow.getCell(11).value = conf.service.level==='BAS' && conf.service.period===3 ? 0 : {formula: `K${rowSummary.number}*0.1`} //???????
                serviceRow.getCell(12).value = {formula: `K${serviceRow.number}*C${serviceRow.number}`}
                serviceRow.getCell(10).fill = fill
                serviceRow.getCell(11).fill = fill
                serviceRow.getCell(12).fill = fill
            }
            summaryRows.push(serviceRow.number)
        }

        if (conf.brokenStorageService && storageRows.length) {
            let formula = []
            for (const num of storageRows) {
                formula.push(`E${num}*0.2`)
            }
            const data = [
                'SUP-NR-DRIVE',
                'Невозврат неисправных накопителей',
                {formula: `+C${rowSummary.number}`},
                conf.storagePrice * (confidential || user.currency === 'USD' ? 1 : course),
            ]
            const brokenStorageRow = worksheet.addRow(data)
            brokenStorageRow.getCell(5).value = {formula: `C${brokenStorageRow.number}*D${brokenStorageRow.number}`}
            brokenStorageRow.getCell(6).value = {formula: `+F18`}
            brokenStorageRow.getCell(7).value = {formula: `D${brokenStorageRow.number}-D${brokenStorageRow.number}*F${brokenStorageRow.number}`}
            brokenStorageRow.getCell(8).value = {formula: `G${brokenStorageRow.number}*C${brokenStorageRow.number}`}
            if (confidential) {
                brokenStorageRow.getCell(12).value = {formula: `C${brokenStorageRow.number}*D${brokenStorageRow.number}`}
                brokenStorageRow.getCell(10).fill = fill
                brokenStorageRow.getCell(11).fill = fill
                brokenStorageRow.getCell(12).fill = fill
            }
            summaryRows.push(brokenStorageRow.number)
        }

        if (confidential) {
            rowSummary.getCell(4).value = {formula: `SUMPRODUCT(C${partRowNumbers[0]}:C${partRowNumbers[partRowNumbers.length - 1]},D${partRowNumbers[0]}:D${partRowNumbers[partRowNumbers.length - 1]})`}
            rowSummary.getCell(4).alignment = {vertical: 'middle'}
            rowSummary.getCell(11).value = {formula: `SUMPRODUCT(C${partRowNumbers[0]}:C${partRowNumbers[partRowNumbers.length - 1]},K${partRowNumbers[0]}:K${partRowNumbers[partRowNumbers.length - 1]})`}
        }
    }
    let formula = []
    let formula2 = []
    let formula3 = []
    for (const row of summaryRows) {
        formula.push(`H${row}`)
        formula2.push(`L${row}`)
        formula3.push(`E${row}`)
    }
    const sumServ = worksheet.addRow(['', 'Итого вкл. НДС 20%. ' + (confidential ? '$' : user.currency)])

    sumServ.getCell(5).value = {formula: formula3.join('+')}
    sumServ.getCell(8).value = {formula: formula.join('+')}
    if(confidential) {
        sumServ.getCell(12).value = {formula: formula2.join('+')}
    }
    //sumServ.getCell(12).style = {numFmt}
    for (let i = 1; i <= (confidential ? 12 : 9); i++) {
        if(i===9) continue
        sumServ.getCell(i).style = {
            fill: {type: 'pattern', pattern: 'solid', bgColor: {argb: 'DDDDDDDD'}, fgColor: {argb: 'DDDDDDDD'}},
            numFmt
        }
    }
    //sumServ.getCell(8).style = {numFmt}
    //sumServ.getCell(5).style = {numFmt}

    //sumServ.fill = {type: 'pattern', pattern: 'solid', bgColor: {argb: 'DDDDDDDD'}, fgColor: {argb: 'DDDDDDDD'}}
    sumServ.height = 20
    return sumServ.number
}