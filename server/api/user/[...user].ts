import {Token} from "~/server/models/token.model";
import {User, validateEmail} from "~/server/models/user.model";
import crypto from "crypto";

//User.deleteMany().then(console.log)
const router = createRouter()

router.post('/inn', defineEventHandler(async (event) => {
    const {inn} = await readBody(event)
    const url = "http://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party";
    const token = "257cfbf98eb1c4e3a91808b98089ca998c42e34a";
    const query = "7707083893";
    const response = await fetch(url, {
        method: "POST",
        mode: "cors",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": "Token " + token
        },
        body: JSON.stringify({query: inn})
    })
    const org = await response.json()
    return org.suggestions

}))

router.post('/request-restore-password', defineEventHandler(async (event) => {
    const {email} = await readBody(event)
    const user = await User.findOne({email});
    if (!user) {
        //await utils.sleep(4000)
        return 1
    }
    user.restorePassword = crypto.createHmac('sha256', '').update(Math.random().toString()).digest('hex')
    await user.save()
    const host = getHeader(event, 'host')
    const res = await utils.sendMail({
        to: email,
        subject: 'Восстановить пароль',
        text: `Ссылка для восстановления ${host}/password-restore-${user.restorePassword}`
    })
    if (!res.messageId) throw createError({statusCode: 500, message: 'Ошибка отправки'})
    return 1
}))

router.post('/process-restore-password', defineEventHandler(async (event) => {
    const {code} = await readBody(event)
    const user = await User.findOne({restorePassword: code});
    if (!user) return
    const password = crypto.createHmac('sha256', '').update(Math.random().toString()).digest('hex').substring(1, 5)
    user.password = password
    user.restorePassword = ''
    await user.save()
    const res = await utils.sendMail({
        to: user.email,
        subject: 'Новый пароль',
        text: `Используйте этот пароль: ${password}`
    })
    return 1
}))

router.get('/checkAuth', defineEventHandler(async (event) => {
    return event.context.user
}))

router.get('/logout', defineEventHandler(async (event) => {
    const cookies = parseCookies(event)
    const config = useRuntimeConfig(event)
    await Token.deleteOne({access: cookies[config.public.authTokenName]});
    deleteCookie(event, config.public.authTokenName)
}))

router.get('/check-email/:email', defineEventHandler(async (event) => {
    const {email} = event.context.params as Record<string, string>
    const reg = await Registration.countDocuments({email})
    const user = await User.findOne({email})
    if (user) {
        return {msg: 'Этот e-mail занят', error: true}
    }
    if (reg) {
        return {msg: `На регистрацию этого e-mail подано заявок: ${reg}`}
    }
    return {}
}))


router.post('/registration', defineEventHandler(async (event) => {
    const body = await readBody(event)
    const host = getHeader(event, 'host')
    const exists = await Registration.findOne({email: body.email})
    const existsUser = await User.findOne({email: body.email})
    if (exists || existsUser) return {error: `Заявка на регистрацию "${body.email}" уже существует`}
    const role = await Role.findOne({name: 'user'})
    body.roles = [role?.id]
    const user = await Registration.create(body)
    const users = await User.find().populate('roles')
    const url = `http://${host}${process.env.TEST_PORT ? ':' + process.env.TEST_PORT : ''}/admin/user-confirm?id=${user.id}`
    const text = `Для подтверждения/отклонения регистрации пройдите по ссылке ${url}\n${JSON.stringify(body)}`
    const subject = 'Заявка на регистрацию нового пользователя'
    const emails = []
    for (const user of users) {
        if (user.isAdmin) {
            emails.push(user.email)
        }
    }
    try {
        const r = await utils.sendMail({
            to: emails,
            subject,
            text
        })

    } catch (err) {
        console.error(err)
        //return {error: `Заявка на регистрацию "${body.email}" уже существует`}
    }
    return {ok: 200}
}))
//User.deleteMany().then(console.log)
//User.findById('636376c6a98e169787cf0a99').then(console.log)
router.post('/login', defineEventHandler(async (event) => {
    const {email, password} = await readBody(event)
    const user = await User.findOne({email}).populate('roles');
    if (user?.checkPasswd(password)) {
        await utils.setAuthToken(event, user)
        return utils.adaptUser(user)
    } else throw createError({statusCode: 401, message: 'Ошибка аутентификации'})
}))
router.get('/:_id/toggle-admin', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isAdmin) throw createError({statusCode: 403, message: 'Доступ запрещён'})
    const {_id} = event.context.params as Record<string, string>
    const found = await User.findById(_id);
    if (!found) throw createError({statusCode: 401, message: 'Ошибка аутентификации'})
    found.isAdmin = !found.isAdmin
    await found.save()
}))

router.post('/update', defineEventHandler(async (event) => {
    const bodyUser = await readBody(event)
    const user = event.context.user
    if (!user) throw createError({statusCode: 403, message: 'Доступ запрещён'})
    const found = await User.findById(user.id)
    if (!found) throw createError({statusCode: 403, message: 'STRANGE: user not found: ' + user.id,})
    if (!validateEmail(bodyUser.email)) throw createError({statusCode: 403, message: 'Wrong email'})
    const fields = ['name', 'email', 'avatarImage', 'currency']
    for (const field of fields) {
        found[field] = bodyUser[field]
    }
    try {
        await found.save()
    } catch (e: any) {
        console.error(e)
        if (e.code === 11000) throw createError({statusCode: 406, message: 'This email is already taken'})
        throw createError({statusCode: 406, message: e.message})
    }
}))

//User.updateOne({email:'abrikoz@gmail.com'},{passwordHash:'d09ae2219e185ef2cbc84e1425e6cc08959a831e0646a0d85bd1542505571098'}).then(console.log)

router.post('/password', defineEventHandler(async (event) => {
    const {password, password2} = await readBody(event)
    const user = event.context.user
    if (!user) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    if (password && password === password2) {
        user.password = password
        await user.save()
    } else {
        throw createError({statusCode: 400, message: 'Ошибка смены пароля',})
    }
}))

export default useBase('/api/user', router.handler)
