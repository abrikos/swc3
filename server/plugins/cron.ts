import moment from "moment";

async function deleteRegistrations() {
    const day7 = moment().add(-7, 'day')
    const date = new Date(day7.year(), day7.month(), day7.date());

    const regs = await Registration.find({createdAt: {$lt: date}});
    for (const reg of regs) {
        console.log(reg)
        const subject = 'заявка не рассмотрена'
        const text = 'Ваш запрос не был рассмотрен, просьба связаться пригласившем сотрудником QTECH и повторно отправить запрос'
        utils.sendMail({to: reg.email, subject, text})
        //console.log(moment(reg.createdAt).format('YYYY-MM-DD HH:mm:ss'));
    }
    await Registration.deleteMany({createdAt: {$lt: date}});

}

async function quartNotifications() {
    const projects = await Project.find({
        status: 'Активный',
        month: {$gte: parseInt(moment().format('MM'))},
        year: {$gte: parseInt(moment().format('YYYY'))}
    })
        .populate(["user", 'manager'])
    for (const project of projects) {
        const date = moment({y: project.year, M: project.month - 1, d: 1})
        if (date.isValid()) {
            const now = moment()
            const days = date.diff(now, 'days')
            const quarter = moment().startOf('quarter')
            const daysFromQuarter = now.diff(quarter, 'days')
            const url = 'http://srvcfg.qtech.ru/projects/' + project.id
            const text = `До окончания проекта "${project.name}" (${project.customer} ${project.inn}) осталось дней: ${days}. ${url}`
            const emails = [project.user.email, project.emails]
            emails.push(project.manager.email)
            if (daysFromQuarter === 1 || days === 30 || days === 7) {
                await utils.sendMail({to: emails, subj: `Просьба обновить статус проекта - "${project.name}"`, text})
            }
        }
    }

}

export default defineNitroPlugin(() => {
    setInterval(() => {
        deleteRegistrations()
    }, 1000 * 3600)

    setInterval(() => {
        Part.deleteMany({component: null}).then(() => {
        })
    }, 3600 * 1000 * 24)

    //setInterval(quartNotifications, 1000 * 3600 * 24);
})