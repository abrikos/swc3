import {specToXls} from "~/server/utils/excel/excel";

const router = createRouter()


router.get('/:id/excel', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isServer) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {id} = event.context.params as Record<string, string>
    const spec = await Spec.findById(id).populate(Spec.getPopulation())
    if (!spec) throw createError({statusCode: 404, message: ('Конфигурация не найдена'),})
    const {confidential} = getQuery(event)
    event.node.res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    event.node.res.setHeader("Content-Disposition", "attachment; filename=" + encodeURIComponent(spec.name) + (confidential!=='0' ? '-confidential' : '') + ".xlsx");
    const settings = await Settings.findOne()
    return specToXls(spec, user, user.isAdmin && confidential!=='0', settings?.course || 0)
}))

router.post('/list', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isServer) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const filter = await readBody(event)
    if (!filter.all) {
        filter.user = user
    }
    delete filter.all
    const perPage = parseInt(getQuery(event).rowsPerPage as string)
    const page = Math.max(0, parseInt(getQuery(event).page as string))
    const specs = await Spec.find(filter)
        .limit(perPage)
        .skip(page)
        .sort({createdAt: 'desc'})
        .populate(['user', ...Spec.getPopulation()])
    const count = await Spec.countDocuments(filter);
    return {count, specs}
}))
//Spec.findById('6826a9e337c239f046b70939').populate(['project', {path:'configurations', populate:Conf.getPopulation()},'orders']).then(console.log)

export default useBase('/api/spec', router.handler)
