import {Chassis} from "~/server/models/chassis.model";
import fs from 'fs'

const router = createRouter()


router.get('/list', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user && !user.isServer) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    return Chassis.find({})
}))

router.put('/hide/:id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user && !user.isAdmin) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {id} = event.context.params as Record<string, string>
    const chassis = await Chassis.findById(id)
    if (!chassis) throw createError({statusCode: 404, message: ('Chassis not found'),})
    chassis.hidden = !chassis.hidden
    await chassis.save()
}))

router.post('/upload/:id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user && !user.isAdmin) throw createError({statusCode: 403, message: ('Access denied'),})

    const {id} = event.context.params as Record<string, string>
    const chassis = await Chassis.findById(id)
    if (!chassis) throw createError({statusCode: 404, message: ('Chassis not found'),})
    let formData = await readMultipartFormData(event)
    if (!formData) return
    //fs.writeFileSync(`./upload/chassis/${chassis.partNumber}.jpg`, formData[0].data)
    const storage = useStorage("chassis");

    await storage.setItemRaw(`${chassis.partNumber}.jpg`, formData[0].data);


}))

router.get('/image/:name', defineEventHandler(async (event) => {
    event.node.res.setHeader('Content-Type', 'image/jpeg');
    const {name} = event.context.params as Record<string, string>
    const storage = useStorage("chassis");
    return storage.getItemRaw(name)
}))


export default useBase('/api/chassis', router.handler)
