import {Token} from "~/server/models/token.model";
import {Chassis} from "~/server/models/chassis.model";

const router = createRouter()


router.get('/list', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user && user.isServer) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    return Chassis.find({})
}))

router.put('/hide/:id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user && user.isAdmin) throw createError({statusCode: 403, message: 'Доступ запрещён',})
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
    const storage = useStorage("chassis");
    const x = await storage.keys()
    console.log(x.length)
    if (formData) {
        const r = await storage.setItemRaw(`${chassis.partNumber}.jpg`, formData[0].data);
    }

}))


export default useBase('/api/chassis', router.handler)
