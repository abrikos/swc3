const router = createRouter()


router.post('/list', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isServer) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const filter = await readBody(event)
    console.log(filter)
    if(!filter.all){
        filter.user = user
    }
    delete filter.all
    const perPage = parseInt(getQuery(event).rowsPerPage as string)
    const page = Math.max(0, parseInt(getQuery(event).page as string))
    const specs = await Spec.find(filter)
        .limit(perPage)
        .skip(page)
        .sort({createdAt: 'desc'})
        .populate('project');
    const count = await Spec.countDocuments(filter);
    console.log('zzz', count, filter)
    return { count, specs }
}))

export default useBase('/api/spec', router.handler)
