import moment from "moment";
import mongoose from "mongoose";

const router = createRouter()


router.get('/:_id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isNetwork) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {_id} = event.context.params as Record<string, string>
    return  Order.findOne({_id, user}).populate(['user', ...Order.getPopulation()])
}))

router.get('/categories', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isNetwork) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    return   Category.find().populate('subcategories')
}))

router.get('/devices/:subcategory', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isNetwork) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {subcategory} = event.context.params as Record<string, string>
    return   Device.find({subcategory})//.populate('subcategories')
}))

export default useBase('/api/order', router.handler)
