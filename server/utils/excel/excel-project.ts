import Excel from 'exceljs'
import {servSpec} from "~/server/utils/excel/excel-servers"
import {netSpec} from "~/server/utils/excel/excel-net";

export function projectToXls(project:IProject, user:IUser, confidential:boolean, course:number) {
    const currName = confidential ? '$' : user.currency
    const numFmt = `_(* #,##0.00_)"${currName === 'Рубли' ? 'Р' : '$'}";_(* (#,##0.00);_(* "-"??_);_(@_)`

    const workbook = new Excel.Workbook();
    const imageId1 = workbook.addImage({
        filename: process.cwd() + '/public/logo.png',
        extension: 'jpeg',
    });
    let total = 0
    const worksheet = workbook.addWorksheet(project.name.replace(/[\*|\?|:|\\|\/|\[|\]]/g, '-'));
    worksheet.addImage(imageId1, 'A1:A5');
    worksheet.columns = [
        {header: '', key: 'PN', width: 40},
        {
            header: '',
            key: 'description',
            width: 60,
            alignment: {vertical: 'middle', horizontal: 'center'},
            style: {numFmt}
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
        ['Проект'],
        ['ИД проекта', project.id],
        ['Дата', project.date],
        ['Название', project.name],
        ['Заказчик', project.customer],
        ['Менеджер', project.manager],
        ['Статус', project.status],
        ['QTECH.RU', user.email]
    ])

    const totalSumRow = worksheet.addRow(['Всего вкл. НДС 20%.' + (confidential ? '$' : user.currency)])
    const sumIndexes = []
    for (const spec of project.specs) {
        worksheet.addRow([''])
        const specNameRow = worksheet.addRow(['Спецификация', spec.name])
        specNameRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            bgColor: {argb: 'AAAAAAAA'},
            fgColor: {argb: 'AAAAAAAA'}
        }
        specNameRow.font = {color: {argb: 'FFFFFFFF'}, name: 'Arial'}
        specNameRow.height = 30
        specNameRow.alignment = {vertical: 'middle'}
        if (spec.configurations.length) {
            const serv = servSpec(worksheet, spec, confidential, user, course)
            sumIndexes.push('E' + serv)
        }
        if (spec.orders.length) {
            const net = netSpec(worksheet, spec, confidential, user, course)
            sumIndexes.push('E' + net)
        }
    }
    totalSumRow.getCell(2).value = {formula: sumIndexes.join('+')}
    totalSumRow.getCell(2).style = {numFmt}

    worksheet.addRow([''])
    worksheet.addRow(['Срок действия спецификации 1 неделя с даты создания. Данная спецификация  носит информационный характер и' +
    ' не является публичной офертой. По всем вопросам, связанным с данной спецификацией, обращайтесь к менеджерам по' +
    ' работе с партнерами компании QTECH. '])
    return workbook.xlsx.writeBuffer();
}
