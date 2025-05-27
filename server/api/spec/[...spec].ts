import {specToXls} from "~/server/utils/excel/excel";
import moment from "moment";
import mongoose from "mongoose";

const router = createRouter()


router.get('/:_id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isServer) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {_id} = event.context.params as Record<string, string>
    const filter = user.isAdmin ? {_id} : {_id,user}
    return  Spec.findOne(filter).populate(['user', ...Spec.getPopulation()])

}))

router.get('/add/:_id/:type/:id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isServer) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {_id, type, id} = event.context.params as Record<string, string>
    console.log(_id, type, id)
    const spec = await  Spec.findById(_id)
    if (!spec) throw createError({statusCode: 404, message: ('Спецификация не найдена'),})
    if(type==='order'){
        spec.orders.push(id as unknown as IOrder)
    }
    if(type==='conf'){
        spec.configurations.push(id as unknown as IConf)
    }
    await spec.save()
}))

router.get('/has/:type/:id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isServer) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {type, id} = event.context.params as Record<string, string>
    if(type==='order'){
        return (await Spec.find()).filter((s:ISpec) => s.orders.includes(id as unknown as IOrder));
    }
    if(type === 'conf'){
        return (await Spec.find()).filter((s:ISpec) => s.configurations.includes(id as unknown as IConf));
    }
}))

router.get('/clone/:_id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isServer) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {_id} = event.context.params as Record<string, string>
    const spec = await Spec.findOne({_id, user})
    if (!spec) throw createError({statusCode: 404, message: ('Спецификация не найдена'),})
    spec._id = new mongoose.Types.ObjectId;
    spec.name = 'Клон ' + spec.name
    spec.isNew = true;
    spec.createdAt = new Date();
    spec.save()
    return spec.id
}))

router.delete('/:_id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isServer) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {_id} = event.context.params as Record<string, string>
    return Spec.deleteOne({_id, user})
}))

router.post('/:_id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isServer) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {_id} = event.context.params as Record<string, string>
    return Spec.updateOne({_id, user}, await readBody(event))
}))

router.get('/:id/excel', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isServer) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {id} = event.context.params as Record<string, string>
    const spec = await Spec.findById(id).populate(Spec.getPopulation())
    if (!spec) throw createError({statusCode: 404, message: ('Спецификация не найдена'),})
    const {confidential} = getQuery(event)
    event.node.res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    event.node.res.setHeader("Content-Disposition", "attachment; filename=" + encodeURIComponent(spec.name) + (confidential !== '0' ? '-confidential' : '') + ".xlsx");
    const settings = await Settings.findOne()
    return specToXls(spec, user, user.isAdmin && confidential !== '0', settings?.course || 0)
}))

function prepareRegex(str: string) {
    return {$regex: new RegExp(str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')), $options: 'i'}
}


router.get('/list', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isServer) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    return Spec.find({user})
        .sort({createdAt: -1})
        .populate(Spec.getPopulation())
}))

router.post('/create', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isServer) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const conf = await readBody(event)
    return Spec.create({user, name:'Спецификация от ' +moment().format('YYYY-MM-DD HH:mm'), configurations:[conf]})
}))


router.post('/share/:id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isServer) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {id} = event.context.params as Record<string, string>
    const spec = await Spec.findById(id)
    if (!spec) throw createError({statusCode: 404, message: ('Спецификация не найдена'),})
    const emails = await readBody(event)
    const res = []
    for (const email of emails) {
        const shared = await User.findOne({email}) as IUser
        if(!shared) continue
        spec._id = new mongoose.Types.ObjectId;
        spec.user = shared
        spec.shared = user
        spec.isNew = true;
        spec.createdAt = new Date();
        await spec.save()
        res.push(email)
    }
    return res
}))
router.post('/listBak', defineEventHandler(async (event) => {
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
                        .populate({path: 'specs', populate: ['user', ...Spec.getPopulation()]})
                        .limit(perPage)
                        .skip(page)
                        .sort({createdAt: 'desc'})
                    console.log(users.length)
                    //return {specs:[], count:0}
                    const specs = []
                    for(const user of users){
                        specs.push(...user.specs)
                    }
                    const count = await User.countDocuments(f)
                    return {specs, count}
                } else if (k === 'id') {
                    delete filter.id
                    filter._id = search[k]
                }else {
                    filter[k] = prepareRegex(search[k])
                }
            }
        }
        if (!filter.all) {
            filter.user = user.id
        }
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

export default useBase('/api/spec', router.handler)
