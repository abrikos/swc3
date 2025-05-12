import {Token} from "~/server/models/token.model";
import {User, validateEmail} from "~/server/models/user.model";
import crypto from "crypto";

//User.deleteMany().then(console.log)
const router = createRouter()

router.post('/request-restore-password', defineEventHandler(async (event) => {
    const {email} = await readBody(event)
    const user = await User.findOne({email});
    if (!user) {
        //await utils.sleep(4000)
        return 1
    }
    user.restorePassword = crypto.createHmac('sha256', '').update(Math.random().toString()).digest('hex')
    await user.save()
    const res = await utils.sendMail({
        to: email,
        subject: 'Восстановить пароль',
        text: `Ссылка для восстановления ${event.node.req.headers.origin}/password-restore-${user.restorePassword}`
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

router.get('/list-all', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isAdmin) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    return User.find({}, '-passwordHash')
}))

router.delete('/:_id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isAdmin) throw createError({statusCode: 403, message: 'Доступ запрещён'})
    const {_id} = event.context.params as Record<string, string>
    await User.findByIdAndDelete(_id)
}))


router.get('/logout', defineEventHandler(async (event) => {
    const cookies = parseCookies(event)
    const config = useRuntimeConfig(event)
    await Token.deleteOne({access: cookies[config.public.authTokenName]});
    deleteCookie(event, config.public.authTokenName)
}))


router.put('/signup', defineEventHandler(async (event) => {
    const {email, password} = await readBody(event)
    try {
        const user = await User.create({email, password});
        const found = await User.findById(user.id, '-passwordHash')
        if (!found) return
        await utils.setAuthToken(event, found)
        return utils.adaptUser(found)
    } catch (err) {
        throw createError({statusCode: 400, message: 'Ошибка регистрации'})
    }

}))
//User.deleteMany().then(console.log)
//User.find().then(console.log)
router.post('/login', defineEventHandler(async (event) => {
    const {email, password} = await readBody(event)
    const user = await User.findOne({email});
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
    const {name, email, avatarImage} = await readBody(event)
    const user = event.context.user
    if (!user) throw createError({statusCode: 403, message: 'Доступ запрещён'})
    const found = await User.findById(user.id)
    if (!found) throw createError({statusCode: 403, message: 'STRANGE: user not found: ' + user.id,})
    if (!validateEmail(email)) throw createError({statusCode: 403, message: 'Wrong email'})
    found.email = email
    found.name = name
    found.avatarImage = avatarImage
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
    }else{
        throw createError({statusCode: 400, message: 'Ошибка смены пароля',})
    }
}))

export default useBase('/api/user', router.handler)
