import moment from "moment";
import mongoose from "mongoose";

const router = createRouter()


router.get('/:_id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isNetwork) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {_id} = event.context.params as Record<string, string>
    return Order.findOne({_id, user}).populate(['user', ...Order.getPopulation()])
}))

router.post('/update/:_id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isNetwork) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {_id} = event.context.params as Record<string, string>
    const order = await Order.findOne({_id, user}).populate(Order.getPopulation())
    if (!order) throw createError({statusCode: 404, message: 'Ордер не найден',})
    const body = await readBody(event)
    order.name = body.name
    order.count = body.count
    await order.save()
    await OrderItem.deleteMany({order})
    for (const item of body.items) {
        item.order = order
        await OrderItem.create(item)
    }
}))

//OrderItem.findOne({powerForDevice:{$ne:null}}).populate(OrderItem.getPopulation()).then(console.log)
//Device.findOne({name:'QSW-6910-26F'}).populate('subcategory').then(console.log)

router.get('/wifi-servers', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isNetwork) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const subcats = await SubCategory.find({name: 'Серверы для Wi-Fi'})
    return Device.find({subcategory: {$in: subcats.map(s => s.id)}});
}))
router.get('/wifi-licenses', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isNetwork) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    return Device.find({name: {$in: ['QWC-WM', 'QWC-WMAP', 'QWC-WMHM']}});
}))

router.get('/categories', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isNetwork) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    return Category.find({
        name: {
            $ne: undefined,
            $in: ['VoIP', 'Wi-Fi решения', 'Оптические трансиверы xWDM', 'Маршрутизаторы', 'Коммутаторы Enterprise', 'Коммутаторы SMB', 'Оптические модули']
        }, deleted: false
    }).sort('name').populate('subcategories')
}))

router.get('/devices/:subcategory', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isNetwork) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {subcategory} = event.context.params as Record<string, string>
    return Device.find({subcategory})//.populate('subcategories')
}))

router.post('/basket/save', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isNetwork) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {spec} = getQuery(event)
    const items = await readBody(event)
    const order = await Order.create({user, name: 'Сетевая конфигурация ' + moment().format('YYYY-MM-DD HH:mm'),})

    for (const item of items) {
        item.order = order
        item.sortName = item.device.name
        await OrderItem.create(item)
    }

    if (spec) {
        const s = await Spec.findById(spec)
        if (s) {
            s.orders.push(order.id)
            await s.save()
        }
    }
    return order.id
}))

export default useBase('/api/order', router.handler)
