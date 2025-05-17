import Excel from 'exceljs'
import {servSpec} from "./excel-servers"
import {netSpec} from "~/server/utils/excel/excel-net";

export const specToXls = async (spec: ISpec, user: IUser, confidential: boolean, course: number) => {
    const currName = confidential ? '$' : user.currency
    const numFmt = `_(* #,##0.00_)"${currName === 'Рубли' ? 'Р' : '$'}";_(* (#,##0.00);_(* "-"??_);_(@_)`
    const workbook = new Excel.Workbook();
    // const imageId1 = workbook.addImage({
    //     filename: '~/public/logo.png',
    //     extension: 'jpeg',
    // });
    let total = 0
    const worksheet = workbook.addWorksheet(spec.name.replace(/[\*|\?|:|\\|\/|\[|\]]/g, '-'));
    //worksheet.addImage(imageId1, 'A1:A5');
    worksheet.columns = [
        {header: '', key: 'PN', width: 40},
        {
            header: '',
            key: 'description',
            width: 60,
            alignment: {vertical: 'middle', horizontal: 'center'},
            style: {numFmt: '0.00'}
        },
        {header: '', key: 'count', width: 12},
        {header: '', key: 'price1', width: 20, style: {numFmt}}, //РРЦ доллар
        {header: '', key: 'price2', width: 20, style: {numFmt}}, //РРЦ стоимость
        {header: '', key: 'discount', width: 20, style: {numFmt}}, //Скидка
        {header: '', key: 'priceRu', width: 20, style: {numFmt}},
        {header: '', key: 'sumRu', width: 20, style: {numFmt}},
        {header: '', key: 'd2', width: 20, style: {numFmt}},
        {header: '', key: 'sd2', width: 20, style: {numFmt}},
        {header: '', key: 'sd3', width: 20, style: {numFmt}},
    ];
    worksheet.addRows([
        ['Спецификация'],
        ['ИД спецификации', spec.id],
        ['Дата спецификации', spec.date],
        ['Название спецификации', spec.name],
        ['Название заказчика', spec.project?.customer],
        ['ИНН заказчика', spec.project?.inn],
        ['BDM', user.fio],
        ['Менеджер', spec.project?.manager?.name],
        //["Сумма серверов, вкл. НДС 20%. " + (confidential ? '$' : user.currency), spec.price * (confidential || user.currency === 'USD' ? 1 : course.course)],
        //["Сумма сетевого, вкл. НДС 20%. Рубли", spec.priceNetwork],
        [],
        ['QTECH.RU', user.email, new Date()]
    ])

    const totalSumRow = worksheet.addRow(['Всего вкл. НДС 20%.' + (confidential ? '$' : user.currency)])
    const servRow = spec.configurations.length ? servSpec(worksheet, spec, confidential, user, course) : 1
    const netRow = spec.orders.length ? netSpec(worksheet, spec, confidential, user, course) : 1
    totalSumRow.getCell(2).value = {formula: `E${servRow}+E${netRow}`}
    totalSumRow.getCell(2).style = {numFmt, font: {bold: true}}
    if (confidential) {
        totalSumRow.getCell(9).value = "Только для внутреннего пользования"
        totalSumRow.getCell(9).style = {font: {color: {argb: 'FFFF0000'}, bold: true, size: 20}}
    }

    worksheet.addRow([''])
    worksheet.addRow(['Срок действия спецификации 1 неделя с даты создания. Данная спецификация  носит информационный характер и' +
    ' не является публичной офертой. По всем вопросам, связанным с данной спецификацией, обращайтесь к менеджерам по' +
    ' работе с партнерами компании QTECH. '])
    return workbook.xlsx.writeBuffer();
}