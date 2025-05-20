import moment from "moment";

async function deleteRegistrations(){
    const day7 = moment().add(-7, 'day')
    const date = new Date(day7.year(), day7.month(), day7.date());

    const regs = await Registration.find({createdAt:{$lt:date}});
    for (const reg of regs) {
        console.log(reg)
        const subject = 'заявка не рассмотрена'
        const text = 'Ваш запрос не был рассмотрен, просьба связаться пригласившем сотрудником QTECH и повторно отправить запрос'
        utils.sendMail({to:reg.email, subject, text})
        //console.log(moment(reg.createdAt).format('YYYY-MM-DD HH:mm:ss'));
    }
    await Registration.deleteMany({createdAt:{$lt:date}});

}

export default defineNitroPlugin(() => {
   setInterval(() => {
       deleteRegistrations()
   },1000 * 3600)
})