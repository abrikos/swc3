import moment from "moment";
import mongoose from "mongoose";
import {OrderSubItem} from "~/server/models/order-subitem";

const router = createRouter()


router.get('/:_id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isNetwork) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {_id} = event.context.params as Record<string, string>
    return Order.findOne({_id, user}).populate(['user', ...Order.getPopulation()])
}))

router.delete('/delete/:_id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isNetwork) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {_id} = event.context.params as Record<string, string>
    return Order.deleteOne({_id, user})
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
}))

router.post('/item/sort/:_id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isNetwork) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {_id} = event.context.params as Record<string, string>
    const body = await readBody(event)
    const orig = await OrderItem.findById(_id)
    if(!orig) return
    const other = await OrderItem.findOne({order: orig.order, sort: body.inc + orig.sort})
    if(other){
        orig.sort = body.inc + orig.sort
        other.sort = other.sort - body.inc
        await orig.save()
        await other.save()
    }
}))

router.post('/item/add', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isNetwork) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const body = await readBody(event)
    if (!body.id) {
        const items = await OrderItem.find({order: body.order}).sort({sort: -1})
        body.sort = items[0].sort + 1
        return OrderItem.create(body)
    } else {
        return OrderItem.updateOne({_id: body.id}, body)
    }
}))


router.post('/item/update', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isNetwork) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const body = await readBody(event)
    if (body.count > 0) {
        const item = await OrderItem.findById(body.id).populate(OrderItem.getPopulation()) as IOrderItem
        item.count = body.count
        await item.save()
        for(const sub of item.subItems) {
            sub.count = item.count * (item.device?.isPower ? 2 : 1)
            await sub.save()
        }
    } else {
        return OrderItem.deleteOne({_id: body.id})
    }
}))

router.post('/sub/update', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isNetwork) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const body = await readBody(event)
    if (body.count > 0) {
        return OrderSubItem.updateOne({_id: body.id}, {count: body.count})
    } else {
        return OrderSubItem.deleteOne({_id: body.id})
    }
}))

router.post('/item/add/sub', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isNetwork) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const body = await readBody(event)
    console.log(body)
    const item = await OrderItem.findById(body.item.id).populate(OrderItem.getPopulation()) as IOrderItem
    const sub = item.subItems.find(s=>s.device?.id === body.device?.id)
    if(sub){
        sub.count += body.count
        await sub.save()
    }else{
        return OrderSubItem.create(body)
    }

}))

//OrderSubItem.find().populate('item').then(console.log)
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

router.put('/clone/:id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user && !user.isNetwork) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {id} = event.context.params as Record<string, string>
    const spec2 = await readBody(event)
    const conf = await Order.findById(id)
    if (!conf) throw createError({statusCode: 404, message: ('Конфигурация не найдена'),})
    const spec = await Spec.findOne({_id: spec2.id, user})
    if (!spec) throw createError({statusCode: 404, message: ('Спецификация не найдена'),})
    conf._id = new mongoose.Types.ObjectId;
    conf.name = 'Клон ' + conf.name
    conf.isNew = true;
    await conf.save()
    spec.orders.push(conf)
    await spec.save()
    const parts = await OrderItem.find({order: id})
    for (const part of parts) {
        part._id = new mongoose.Types.ObjectId;
        part.isNew = true;
        part.order = conf
        await part.save()
    }
    return conf.id

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
    let sort = 1
    for (const item of items) {
        item.order = order
        item.sort = sort
        await OrderItem.create(item)
        sort++
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
