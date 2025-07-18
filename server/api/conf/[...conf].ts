import {Chassis} from "~/server/models/chassis.model";
import mongoose from "mongoose";

const router = createRouter()


router.get('/create/chassis/:id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user && user.isServer) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const specId = getQuery(event).spec as string
    const {id} = event.context.params as Record<string, string>
    const conf = await Conf.createCustom(id, user)
    if(specId){
        const spec = await Spec.findOne({ _id: specId, user }) as ISpec
        spec.configurations.push(conf.id)
        await spec.save()
    }
    return conf
}))

router.get('/services', defineEventHandler(async (event) => {
    return Service.find({partNumber: undefined}).sort({partNumber: 1})
}))

router.get('/:cid/to-spec/:sid', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user && user.isServer) throw createError({statusCode: 403, message: 'Доступ запрещён',})

    const {cid, sid} = event.context.params as Record<string, string>
    const conf = await Conf.findById(cid).populate(Conf.getPopulation())
    if (!conf) throw createError({statusCode: 404, message: ('Конфигурация не найдена'),})
    const spec =await Spec.findById(sid)
    if (!spec) throw createError({statusCode: 404, message: ('Спецификация не найдена'),})
    spec.configurations.push(conf)
    await spec.save()

}))

router.put('/clone/:id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user && user.isServer) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {id} = event.context.params as Record<string, string>
    const spec2 = await readBody(event)
    const conf = await Conf.findById(id)
    if (!conf) throw createError({statusCode: 404, message: ('Конфигурация не найдена'),})
    const spec = await Spec.findOne({_id:spec2.id, user})
    if (!spec) throw createError({statusCode: 404, message: ('Спецификация не найдена'),})
    conf._id = new mongoose.Types.ObjectId;
    conf.name = 'Клон ' + conf.name
    conf.isNew = true;
    conf.save()
    spec.configurations.push(conf)
    spec.save()
    return conf.id

}))

router.get('/:id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user && user.isServer) throw createError({statusCode: 403, message: 'Доступ запрещён',})

    const {id} = event.context.params as Record<string, string>
    const conf = await Conf.findById(id).populate(Conf.getPopulation())
    if (!conf) throw createError({statusCode: 404, message: ('Конфигурация не найдена'),})
    const components = await Component.find({deleted: false}).sort({price: 1})
    const specs = (await Spec.find()).filter((s:ISpec) => s.configurations.includes(conf.id));
    return {conf, components, specs}
}))

router.delete('/delete/:_id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user && user.isServer) throw createError({statusCode: 403, message: 'Доступ запрещён',})

    const {_id} = event.context.params as Record<string, string>
    console.log(event.context.params)
    return Conf.deleteOne({_id})
}))

router.post('/update/:_id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user && !user.isServer) throw createError({statusCode: 403, message: ('Доступ запрещён'),})
    const {_id} = event.context.params as Record<string, string>
    const conf = await Conf.findOne({_id, user}).populate(Conf.getPopulation()) as IConf
    if (!conf) throw createError({statusCode: 404, message: ('Конфигурация не найдена'),})
    const body = await readBody(event)
    if (body.count) conf.count = body.count
    if (body.name) conf.name = body.name
    if (body.service) conf.service = body.service
    if (body.brokenStorageService) conf.brokenStorageService = body.brokenStorageService
    await conf.save()
}))
//Component.find({partNumber:'bplnab2u8b'}).then(console.log)

router.post('/component-count/:_id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user && !user.isServer) throw createError({statusCode: 403, message: ('Доступ запрещён'),})
    const {_id} = event.context.params as Record<string, string>
    const configuration = await Conf.findOne({_id, user}).populate(Conf.getPopulation()) as IConf
    if (!configuration) throw createError({statusCode: 404, message: ('Конфигурация не найдена'),})
    const [cid,count] = await readBody(event)
    const component = await Component.findById(cid);
    if (!component) throw createError({statusCode: 404, message: ('Компонент не найден'),})
    if (count * 1) {
        await Part.updateOne({component, configuration}, {count}, {upsert: true})
    }
    else {
        await Part.deleteOne({component, configuration})
    }

}))

router.post('/upload/:id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user && !user.isAdmin) throw createError({statusCode: 403, message: ('Доступ запрещён'),})

    const {id} = event.context.params as Record<string, string>
    const chassis = await Chassis.findById(id)
    if (!chassis) throw createError({statusCode: 404, message: ('Chassis not found'),})
    let formData = await readMultipartFormData(event)
    const storage = useStorage("uploads");
    if (formData) {
        const r = await storage.setItemRaw(`${chassis.partNumber}.jpg`, formData[0].data);
    }
}))

router.delete('/part/:_id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user && !user.isServer) throw createError({statusCode: 403, message: ('Доступ запрещён'),})
    const {_id} = event.context.params as Record<string, string>
    const part = await Part.findById(_id).populate('configuration') as IPart
    if (!part) throw createError({statusCode: 404, message: ('Не найдено'),})
    if(!part.configuration.user.equals(user.id)) throw createError({statusCode: 403, message: ('Доступ запрещён'),})
    return Part.deleteOne({_id})
}))


export default useBase('/api/conf', router.handler)
