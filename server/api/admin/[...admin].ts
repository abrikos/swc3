import {Settings} from "~/server/models/settings.model";
import mongoose from "mongoose";
import {User} from "~/server/models/user.model";

const router = createRouter()

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
    const {_id} = event.context.params as Record<string, string>
    await User.findByIdAndDelete(_id)
}))


router.get('/roles', defineEventHandler(async (event) => {
    checkAdmin(event.context.user)
    return Role.find()
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

router.get('/user/:id', defineEventHandler(async (event) => {
    checkAdmin(event.context.user)
    const {id} = event.context.params as Record<string, string>
    return User.findById(id).populate(User.getPopulation())
}))

router.post('/registration/confirm/:_id', defineEventHandler(async (event) => {
    checkAdmin(event.context.user)
    const {_id} = event.context.params as Record<string, string>
    const reg = await Registration.findById(_id)
    if (!reg) throw createError({statusCode: 404, message: 'Регистрация не найдена',})

    reg.password = Math.random().toString(36).slice(-8)
    if(!reg.roles.length){
        const role = await Role.findOne({name:'user'})
        reg.roles = [role?.id]
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


export default useBase('/api/admin', router.handler)
