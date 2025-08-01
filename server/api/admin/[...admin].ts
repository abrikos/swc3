import {Settings} from "~/server/models/settings.model";
import mongoose from "mongoose";
import {User} from "~/server/models/user.model";
import fs from "fs";
import {
    parseNetTrans,
    parseNetworkXLS,
    parseServiceXLS,
    parseComponentXLS,
    parseManagers,
    parseNetServices
} from "~/server/utils/import";
import {LogAdmin} from "~/server/models/log.model";
import {H3Event} from "h3";
import moment from "moment";

const router = createRouter()

async function logAction(event: H3Event) {
    await LogAdmin.create({
        user: event.context.user,
        route: JSON.stringify(event.context.matchedRoute),
        params: getQuery(event),
        data: await readBody(event)
    });
}

function checkAdmin(user: IUser) {
    if (!user || !user.isAdmin) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    return user
}

router.get('/list-all', defineEventHandler(async (event) => {
    checkAdmin(event.context.user)
    return User.find({}, '-passwordHash').populate(User.getPopulation())
}))

router.delete('/user/delete/:_id', defineEventHandler(async (event) => {
    checkAdmin(event.context.user)
    await logAction(event)
    const {_id} = event.context.params as Record<string, string>
    await User.findByIdAndDelete(_id)
}))


router.get('/roles', defineEventHandler(async (event) => {
    checkAdmin(event.context.user)
    return Role.find({name: {$in: ['admin', 'External', 'Internal', 'BDM']}})
}))

router.get('/log', defineEventHandler(async (event) => {
    checkAdmin(event.context.user)
    return LogAdmin.find().sort({createdAt: -1}).populate('user')
}))

router.get('/registrations', defineEventHandler(async (event) => {
    checkAdmin(event.context.user)
    return Registration.find().sort({createdAt: -1})
}))

router.get('/registration/:id', defineEventHandler(async (event) => {
    checkAdmin(event.context.user)
    const {id} = event.context.params as Record<string, string>
    return Registration.findById(id)
}))

router.post('/user/update/:_id', defineEventHandler(async (event) => {
    checkAdmin(event.context.user)
    await logAction(event)
    const body = await readBody(event)
    const {_id} = event.context.params as Record<string, string>
    const user = await User.findById(_id)
    if (!user) throw createError({statusCode: 404, message: 'Юзер не найдена',})
    if (body.password) {
        user.password = body.password
    }
    const fields = ['type', 'firstName', 'lastName',
        'middleName',
        'inn',
        'company',
        'jobTitle',
        'phone',
        'parent', 'blocked']
    for (const field of fields) {
        user[field] = body[field]
    }
    await user.save()
    return user
}))

router.post('/user/create', defineEventHandler(async (event) => {
    checkAdmin(event.context.user)
    await logAction(event)
    const user = await readBody(event)
    if (!user.email.includes('@qtech.ru')) {
        user.role = 'External'
    }
    return User.create(user)
}))

router.get('/user/:id', defineEventHandler(async (event) => {
    checkAdmin(event.context.user)
    const {id} = event.context.params as Record<string, string>
    return User.findById(id).populate(User.getPopulation())
}))

router.get('/specs', defineEventHandler(async (event) => {
    checkAdmin(event.context.user)
    const specs = await Spec.find().sort({createdAt:-1}).populate({path: 'user', select: ['email']})
    return specs.map((s:ISpec)=>({id:s.id,name:s.name,date:s.date,user:s.user?.email}))
}))

router.post('/services-add', defineEventHandler(async (event) => {
    checkAdmin(event.context.user)
    await logAction(event)
    const body = await readBody(event)
    const exists = await Service.findOne({...body, partNumber: undefined})
    if (exists) throw createError({statusCode: 400, message: 'Такой сервис уже создан',})
    return Service.create({...body, article: Math.random()})
}))

router.post('/services-update', defineEventHandler(async (event) => {
    checkAdmin(event.context.user)
    await logAction(event)
    const body = await readBody(event)
    console.log(body)
    return Service.updateOne({_id: body.id}, body)
}))

router.delete('/services-delete/:_id', defineEventHandler(async (event) => {
    checkAdmin(event.context.user)
    await logAction(event)
    const {_id} = event.context.params as Record<string, string>
    return Service.deleteOne({_id})
}))

router.post('/registration/confirm/:_id', defineEventHandler(async (event) => {
    checkAdmin(event.context.user)
    await logAction(event)
    const {_id} = event.context.params as Record<string, string>
    const reg = await Registration.findById(_id)
    if (!reg) throw createError({statusCode: 404, message: 'Регистрация не найдена',})

    reg.password = Math.random().toString(36).slice(-8)
    if (!reg.email.includes('@qtech.ru')) {
        reg.role = 'External'
    }

    const user = await User.create(reg.toJSON())
    await Registration.deleteMany({email: user.email})
    const text = `Здравствуйте, ${user.fio}
        Вы зарегистрированы в Конфигураторе QTECH
        http://srvcfg.qtech.ru
        login: ${user.email}
        password: :${reg.password}`
    //const text = new Array(190).join('z');
    //console.log(text)
    const subject = 'Регистрация одобрена'
    await utils.sendMail({to: user.email, subject, text})
    //const x = await utils.sendMail({to: 'abrikoz@gmail.com', subject, text})
    //console.log(x)
    return user

}))

//utils.sendMail({to: 'abrikoz@gmail.com', subject:'1', text:'1'}).then(console.log)

router.post('/registration/reject/:_id', defineEventHandler(async (event) => {
    checkAdmin(event.context.user)
    await logAction(event)
    const {_id} = event.context.params as Record<string, string>
    const reg = await Registration.findById(_id)
    if (!reg) throw createError({statusCode: 404, message: 'Регистрация не найдена',})
    const text = `Здравствуйте, ${reg.fio}
                Ваш запрос отклонён, просьба связаться пригласившем сотрудником QTECH и повторно отправить запрос
                `
    const subject = 'Регистрация НЕ одобрена'
    await utils.sendMail({to: reg.email, subject, text})
    await Registration.deleteOne({_id})
}))

router.get('/import-list', defineEventHandler(async (event) => {
    checkAdmin(event.context.user)
    const storage = useStorage();
    return  storage.keys('excel')
}))

router.post('/import/:type', defineEventHandler(async (event) => {
    checkAdmin(event.context.user)
    await logAction(event)
    const {type} = event.context.params as Record<string, string>
    let formData = await readMultipartFormData(event)
    const storage = useStorage("excel");
    if (formData) {
        await storage.setItemRaw(`${moment().format('YYYY-MM-DD')}-${formData[0].name}`, formData[0].data);
        switch (type) {
            case 'net':
                return parseNetworkXLS(formData[0].data)
            case 'serv':
                return parseComponentXLS(formData[0].data)
            case 'service':
                return parseServiceXLS(formData[0].data)
            case 'trans':
                return parseNetTrans(formData[0].data)
            case 'manager':
                return parseManagers(formData[0].data)
            default:
        }
    }

}))


export default useBase('/api/admin', router.handler)
