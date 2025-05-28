import {specToXls} from "~/server/utils/excel/excel";
import moment from "moment";
import mongoose from "mongoose";

const router = createRouter()

async function getProjectForUserOrManager(id:string) {
    return  Project.findById(id).populate(Project.getPopulation());
    /*if (project?.user.id === user?.id || project?.manager.email === user?.email) {
        return project;
    }
    throw {error: 404, message: 'Проект не найден'}*/
}




router.get('/list', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isProject) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    return Project.find({user}).sort({createdAt: -1}).populate(Project.getPopulation())
}))

router.get('/:_id', defineEventHandler(async (event) => {
    //const user = event.context.user
    //if (!user || !user.isServer) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {_id} = event.context.params as Record<string, string>
    return getProjectForUserOrManager(_id)
}))

router.get('/managers', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isProject) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    return Manager.find()
}))


router.get('/statuses', defineEventHandler(async (event) => {
    return Project.statusesArr
}))

router.post('/:_id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isServer) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {_id} = event.context.params as Record<string, string>
    const project = await Project.findOne({_id, user})
    if(!project) throw createError({statusCode: 404, message: 'Проект не найден'})
    const fields = ['status', 'inn', 'customer', 'manager', 'partner', 'distributor', 'emails', 'expiredDate']
    const body = await readBody(event)
    for(const f of fields){
        project[f] = body[f]
    }
    await project.save()
}))

//Project.findById('674ed10e706c44002314a5ae').populate(Project.getPopulation()).then(console.log)

export default useBase('/api/project', router.handler)
