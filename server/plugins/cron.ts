import moment from "moment";
import {User} from "~/server/models/user.model";

async function setCourse() {
    const url = 'https://www.cbr-xml-daily.ru/daily_json.js'
    const response = await fetch(url, {})
    if (response) {
        //console.log(res.data.Valute.USD.Value)
        const res = await response.json()
        let settings = await Settings.findOne()
        if (!settings) return
        settings.course = res.Valute.USD.Value * 1.05
        await settings.save()
    }
}

//setCourse()


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
        month: {$gte: moment().month()},
        year: {$gte: moment().year()}
    })
        .populate(["user", 'manager'])
    for (const project of projects) {
        const date = moment([project.year, project.month, 1])
        if (date.isValid()) {
            const now = moment()
            const days = date.diff(now, 'days')
            const quarter = moment().startOf('quarter')
            const daysFromQuarter = now.diff(quarter, 'days')
            const url = 'http://srvcfg.qtech.ru/projects/' + project.id
            const text = `До окончания проекта "${project.name}" (${project.customer} ${project.inn}) осталось дней: ${days}. ${url}`
            const emails = [project.user.email, project.manager.email, ...project.emails.split(',')]
            if (daysFromQuarter === 1 || days === 30 || days === 7) {
                await utils.sendMail({to: emails, subj: `Просьба обновить статус проекта - "${project.name}"`, text})
                project.status = 'Просрочен'
                await project.save()
            }
        }
    }

}

async function clearConfigurations() {
    const day2 = moment().add(-2, 'day')
    const date2 = new Date(day2.year(), day2.month(), day2.date());
    const day30 = moment().add(-30, 'day')
    const date30 = new Date(day30.year(), day30.month(), day30.date());
    const specs = await Spec.find({'configurations.1': {$exists: true}});
    const ids = []
    const idsOrder = []
    for (const spec of specs) {
        ids.push(...spec.configurations)
        idsOrder.push(...spec.orders)
    }
    const confs = await Conf.deleteMany({_id: {$nin: ids}, createdAt: {$lt: date2}});
    const orders = await Order.deleteMany({_id: {$nin: idsOrder}, createdAt: {$lt: date2}});
    const specDel = await Spec.deleteMany({'configurations.1': {$exists: false}, 'orders.1': {$exists: false}, createdAt: {$lt: date30}});
    console.log(confs, specDel);

}

async function refRoles() {
    const users = await User.find().populate('roles')
    for (const user of users) {
        console.log(user.email, user.role, user.roles)
        if (user.roles.map(r => r.name).includes('admin')) {
            user.role = 'admin'

        } else if (user.email.includes('qtech.ru')) {
            user.role = 'Internal'
        } else {
            user.role = 'External'
        }
        try {
            user.save()
        } catch (err) {
            console.log('zzzzzzzzzzz')
            //console.error(err)
        }
    }

}


//User.find({role:undefined}).then(console.log).catch(console.error)


//clearConfigurations()

async function servicesFix(){

    const confs = await Conf.find().populate('service')
    for(const conf of confs){
        if(conf.service) {
            //console.log(conf.id, conf.service.name, conf.service.id)
            conf.service = await Service.findOne({name: conf.service.name, partNumber: undefined}) as IService
            conf.save()
        }
    }
}

export default defineNitroPlugin(() => {
    //refRoles()
    servicesFix();
    setInterval(() => {
        deleteRegistrations()
    }, 1000 * 3600)

    setInterval(() => {
        Part.deleteMany({component: null}).then(() => {
        })
    }, 3600 * 1000 * 24)

    setInterval(quartNotifications, 1000 * 3600 * 24);
    //setInterval(clearConfigurations, 1000 * 3600 * 24);
    setInterval(setCourse, 1000 * 3600)
})