import {Settings} from "~/server/models/settings.model";

const router = createRouter()


router.get('/settings', defineEventHandler(async (event) => {
    //const user = event.context.user
    //if (!user || !user.isAdmin) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    return Settings.findOne()
}))

export default useBase('/api/admin', router.handler)
