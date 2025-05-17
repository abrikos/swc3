import Excel from 'exceljs'

export function netSpec(worksheet:Excel.Worksheet, spec:ISpec, confidential:boolean, user:IUser, course: number) {
    const currName = confidential ? '$' : user.currency
    const numFmt = `_(* #,##0.00_)"${currName}";_(* (#,##0.00);_(* "-"??_);_(@_)`
    const percentFmt = '0.00%'
    const redRowArr = ["Сетевые конфигурации", '', 'Количество',
        "Цена, " + (confidential ? '$' : user.currency),
        "Стоимость, " + (confidential ? '$' : user.currency),
    ]
    if (user.isEmployer) {
        redRowArr.push("Скидка",
            "Сумма, " + currName,
        )
    }
    const redRow2 = worksheet.addRow(redRowArr)
    redRow2.fill = {type: 'pattern', pattern: 'solid', bgColor: {argb: 'FFFF2238'}, fgColor: {argb: 'FFFF2238'}}
    redRow2.font = {color: {argb: 'FFFFFFFF'}, name: 'Arial'}
    redRow2.height = 30
    redRow2.alignment = {vertical: 'middle'}

    const orderRows = []
    for (const order of spec.orders) {
        const orderRow = worksheet.addRow({PN: order.name, count: order.count})
        orderRows.push(orderRow.number)
        // const {errors} = logic(order)
        // if (errors.length) {
        //     const errRow = worksheet.addRow(['', 'В конфигурации есть ошибки'])
        //     const cell = errRow.getCell(2)
        //     cell.style = {font: {color: {argb: 'FFFF0000'}}, bold: true}
        // }
        //orderRow.fill = {type: 'pattern', pattern: 'solid', bgColor: {argb: '00FEFEFE'}, fgColor: {argb: '00FEFEFE'}}
        const orderRowNumbers = []
        for (const item of order.items) {
            const deviceRow = worksheet.addRow([
                item.device?.name || item.service.name,
                item.device?.description,
                item.count,
                (item.device?.price || item.service.price) * (confidential || user.currency === 'USD' ? course : 1)
            ])
            orderRowNumbers.push(deviceRow.number)
            deviceRow.getCell(5).value = {formula: `D${deviceRow.number}*C${deviceRow.number}`}
            if (user.isEmployer) {
                deviceRow.getCell(6).value = item.device?.discount1
                deviceRow.getCell(6).style = {numFmt: '0%'}
                deviceRow.getCell(7).value = {formula: `E${deviceRow.number} - E${deviceRow.number}*F${deviceRow.number}`}
                // deviceRow.getCell(8).value = item.device?.discount2
                // deviceRow.getCell(8).style = { numFmt: '0%' }
                // deviceRow.getCell(9).value = {formula: `E${deviceRow.number} - E${deviceRow.number}*H${deviceRow.number}`}
                // deviceRow.getCell(9).style = {numFmt}
                // deviceRow.getCell(10).value = item.device?.discount3
                // deviceRow.getCell(10).style = { numFmt: '0%' }
                // deviceRow.getCell(11).value = {formula: `E${deviceRow.number} - E${deviceRow.number}*J${deviceRow.number}`}
                // deviceRow.getCell(11).style = {numFmt}
            }
            /*if (item.service) {
                const serviceRow = worksheet.addRow(['', item.service.description, item.count, item.service.price * (confidential || user.currency === 'USD' ? 1 : settings.course)])
                serviceRow.getCell(5).value = {formula: `C${serviceRow.number}*D${serviceRow.number}`}
            }*/
        }
        orderRow.getCell(4).value = {formula: `SUM(E${orderRowNumbers[0]}:E${orderRowNumbers[orderRowNumbers.length - 1]}`}
        orderRow.getCell(5).value = {formula: `D${orderRow.number} * C${orderRow.number}`}
        if (user.isEmployer) {
            orderRow.getCell(7).value = {formula: `SUM(G${orderRowNumbers[0]}:G${orderRowNumbers[orderRowNumbers.length - 1]}`}
            orderRow.getCell(9).value = {formula: `SUM(I${orderRowNumbers[0]}:I${orderRowNumbers[orderRowNumbers.length - 1]}`}
            orderRow.getCell(11).value = {formula: `SUM(K${orderRowNumbers[0]}:K${orderRowNumbers[orderRowNumbers.length - 1]}`}
        }
        orderRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            bgColor: {argb: 'DDDDDDDD'},
            fgColor: {argb: 'DDDDDDDD'}
        }

    }
    let formulaNet = ''
    for (const row of orderRows) {
        formulaNet += `E${row}+`
    }
    formulaNet += '0'
    const sumNet = worksheet.addRow(['', 'Итого вкл. НДС 20%. ' + (confidential ? '$' : user.currency), '', '', {formula: formulaNet}])
    sumNet.fill = {type: 'pattern', pattern: 'solid', bgColor: {argb: 'DDDDDDDD'}, fgColor: {argb: 'DDDDDDDD'}}
    sumNet.height = 20

    return sumNet.number
}