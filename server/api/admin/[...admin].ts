const router = createRouter()


router.get('/list', defineEventHandler(async (event) => {
    //const user = event.context.user
    //if (!user || !user.isAdmin) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    return Chassis.find({})
}))

export default useBase('/api/chassis', router.handler)
