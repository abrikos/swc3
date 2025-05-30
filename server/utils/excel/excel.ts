import Excel from 'exceljs'
import {servSpec} from "~/server/utils/excel/excel-servers"
import {netSpec} from "~/server/utils/excel/excel-net";
import FillPattern from "exceljs/index";

export const specToXls = async (spec: ISpec, user: IUser, confidential: boolean, course: number) => {
    const currName = confidential ? '$' : user.currency
    const numFmt = `_(* #,##0.00_)"${currName === 'Рубли' ? 'Р' : '$'}";_(* (#,##0.00);_(* "-"??_);_(@_)`
    const workbook = new Excel.Workbook();
    const imageId1 = workbook.addImage({
        filename: process.cwd() + '/public/logo.png',
        extension: 'jpeg',
    });
    const worksheet = workbook.addWorksheet(spec.name.replace(/[\*|\?|:|\\|\/|\[|\]]/g, '-'));
    //worksheet.addImage(imageId1, 'A1:A5');

    const fill = confidential ? {type: 'pattern', pattern: 'solid', bgColor: {argb: 'FFCCCC00'}, fgColor: {argb: 'FFCCCC00'}} as FillPattern : {}
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
        {header: '', key: 'confidential1', width: 20, style: {numFmt, fill}},
        {header: '', key: 'confidential2', width: 20, style: {numFmt, fill}},
        {header: '', key: 'confidential3', width: 20, style: {numFmt, fill}}
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
        totalSumRow.getCell(9).style = {font: {color: {argb: 'FFFF0000'}, bold: true, size: 20}, fill}
    }

    worksheet.addRow([''])
    worksheet.addRow(['Срок действия спецификации 1 неделя с даты создания. Данная спецификация  носит информационный характер и' +
    ' не является публичной офертой. По всем вопросам, связанным с данной спецификацией, обращайтесь к менеджерам по' +
    ' работе с партнерами компании QTECH. '])
    worksheet.addRow([''])
    worksheet.addRow(['Условия гарантии:'])
    worksheet.addRow(['На все оборудование распространяется услуга гарантийного и/или сервисного обслуживания.'])
    worksheet.addRow(['Начало гарантии/сервиса считается с момента приобретения оборудования.'])
    worksheet.addRow(['Производитель обязуется в течение всего гарантийного срока устранять выявленные дефекты'])
    worksheet.addRow(['путем ремонта или замены оборудования при условии, что дефект возник по вине Производителя.'])
    worksheet.addRow(['Подробнее по ссылке - www.qtech.ru/support'])

    worksheet.addRow([''])
    worksheet.addRow(['Комплектация:'])
    worksheet.addRow(['Кабель питания 1,5 м. с разъемами IEC320 (Shuko)-C13 входит в комплект блоков питания'])
    worksheet.addRow([''])
    worksheet.addRow(['Условия размещения заказа:'])
    worksheet.addRow(['Спецификация подлежит уточнению перед закупкой/подписанием договора'])
    return workbook.xlsx.writeBuffer();
}