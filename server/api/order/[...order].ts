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

router.get('/item/:_id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isNetwork) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {_id} = event.context.params as Record<string, string>
    return OrderItem.findOne({_id}).populate([{
        path: 'order',
        populate: Order.getPopulation()
    }, ...OrderItem.getPopulation()])
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

router.post('/item/sort', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isNetwork) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {targetItem, item, inc} = await readBody(event)
    const items = await OrderItem.find({order: item.order}).sort({sort: -1}) as IOrderItem[]
    const movedIdx = items.map(item => item.id).indexOf(item.id)
    const targetIdx = items.map(item => item.id).indexOf(targetItem.id)
    items.splice(targetIdx + inc, 0, items[movedIdx])
    items.splice(movedIdx > targetIdx ? movedIdx + 1 : movedIdx, 1)

    let i = items.length - 1
    for (const item of items) {
        console.log(item.sort, i)
        item.sort = i
        await item.save()
        i--
    }
    //return console.log('zzzzzzz', movedIdx, targetIdx)

}))

router.post('/item/add', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isNetwork) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const body = await readBody(event)
    // const exists = await OrderItem.findOne({device: body.device.id, order: body.order})
    //
    // if (exists) {
    //     exists.count++
    //     await exists.save()
    // } else {
    const last = await OrderItem.findOne({order: body.order}).sort({sort: -1}) as IOrderItem
    body.sort = last.sort + 1
    await OrderItem.create(body)
    // }
    // console.log(exists)
}))


router.post('/item/update', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isNetwork) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const body = await readBody(event)
    if (body.count > 0) {
        const item = await OrderItem.findById(body.id).populate(OrderItem.getPopulation()) as IOrderItem
        item.count = body.count
        await item.save()
        for (const sub of item.subItems) {
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

router.post('/item/move', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isNetwork) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {toItem, fromItem} = await readBody(event)
    if (toItem?.id && fromItem?.id) {
        const item = await OrderItem.findById(toItem.id).populate(OrderItem.getPopulation()) as IOrderItem
        const sub = item.subItems.find(s => s.device?.id === fromItem.device?.id)
        if (sub) {
            sub.count++
            await sub.save()
        } else {
            await OrderSubItem.create({item, device: fromItem.device, count: fromItem.count})
        }
        OrderItem.findByIdAndDelete(fromItem.id).then(console.log)
    } else {
        throw createError({statusCode: 406, message: 'No items',})
    }
    return {ok: 9999}
}))


router.post('/item/add/sub', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isNetwork) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const body = await readBody(event)
    const item = await OrderItem.findById(body.item.id).populate(OrderItem.getPopulation()) as IOrderItem
    const sub = item.subItems.find(s => s.device?.id === body.device?.id)
    if (sub) {
        if(body.count*1) {
            sub.count = body.count
            await sub.save()
        }else{
            await OrderSubItem.deleteOne({_id: sub.id})
        }
    } else if(body.device){
        const fields = {device: body.device.id, item: body.item.id}
        return OrderSubItem.create(fields)
    }else{
        const fields = {service: body.service.id, item: body.item.id}
        return OrderSubItem.create(fields)

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
    return order
}))

export default useBase('/api/order', router.handler)
