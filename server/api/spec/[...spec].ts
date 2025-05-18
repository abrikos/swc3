import {specToXls} from "~/server/utils/excel/excel";
import moment from "moment";
import mongoose from "mongoose";

const router = createRouter()


router.get('/:_id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isServer) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {_id} = event.context.params as Record<string, string>
    return  Spec.findOne({_id, user}).populate(Spec.getPopulation())

}))

router.get('/:_id/clone', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isServer) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {_id} = event.context.params as Record<string, string>
    const spec = await Spec.findOne({_id, user})
    if (!spec) throw createError({statusCode: 404, message: ('Конфигурация не найдена'),})
    spec._id = new mongoose.Types.ObjectId;
    spec.name = 'Клон ' + spec.name
    spec.isNew = true;
    spec.createdAt = new Date();
    spec.save()
}))

router.delete('/:_id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isServer) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {_id} = event.context.params as Record<string, string>
    return Spec.deleteOne({_id, user})
}))

router.get('/:id/excel', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isServer) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {id} = event.context.params as Record<string, string>
    const spec = await Spec.findById(id).populate(Spec.getPopulation())
    if (!spec) throw createError({statusCode: 404, message: ('Конфигурация не найдена'),})
    const {confidential} = getQuery(event)
    event.node.res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    event.node.res.setHeader("Content-Disposition", "attachment; filename=" + encodeURIComponent(spec.name) + (confidential !== '0' ? '-confidential' : '') + ".xlsx");
    const settings = await Settings.findOne()
    return specToXls(spec, user, user.isAdmin && confidential !== '0', settings?.course || 0)
}))

router.post('/list', defineEventHandler(async (event) => {
    function prepareRegex(str: string) {
        return {$regex: new RegExp(str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')), $options: 'i'}
    }

    try {
        const user = event.context.user
        if (!user || !user.isServer) throw createError({statusCode: 403, message: 'Доступ запрещён',})
        const perPage = parseInt(getQuery(event).rowsPerPage as string)
        const page = Math.max(0, parseInt(getQuery(event).page as string))
        const [filter, search] = await readBody(event)
        for (const k in search) {
            if (search[k]) {
                if (k === 'date') {
                    const date = moment(search.date)
                    filter.createdAt = {
                        $gte: new Date(date.year(), date.month(), date.date()),
                        $lt: new Date(date.year(), date.month(), date.add(1, 'd').date()),
                    }
                } else if (k === 'user') {
                    const f = {email: prepareRegex(search[k])}
                    const users = await User.find(f)
                        .populate({path: 'specs', populate: ['user', Spec.getPopulation()]})
                        .limit(perPage)
                        .skip(page)
                        .sort({createdAt: 'desc'})

                    //return {specs:[], count:0}
                    const specs = []
                    for(const user of users){
                        specs.push(...user.specs)
                    }
                    const count = await User.countDocuments(f)
                    return {specs, count}
                } else if (k === 'shared') {
                }else {
                    filter[k] = prepareRegex(search[k])
                }
            }
        }
        if (!filter.all) {
            filter.user = user.id
        }
        console.log(filter)
        delete filter.all
        const specs = await Spec.find(filter)
            .limit(perPage)
            .skip(page)
            .sort({createdAt: 'desc'})
            .populate(['user', ...Spec.getPopulation()])
        const count = await Spec.countDocuments(filter);
        return {count, specs}
    } catch (e) {
        console.error(e)
        return {count: 0, specs: []}
    }
}))
//Spec.countDocuments({user:'636376c6a98e169787cf0a99'}).populate(['project', {path:'configurations', populate:Conf.getPopulation()},'orders']).then(console.log)

export default useBase('/api/spec', router.handler)
