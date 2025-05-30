import {specToXls} from "~/server/utils/excel/excel";
import moment from "moment";
import mongoose from "mongoose";
import {FileModel} from "~/server/models/file.model";

const router = createRouter()

async function getProjectForUserOrManager(id: string) {
    return Project.findById(id).populate(Project.getPopulation());
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
    if (!project) throw createError({statusCode: 404, message: 'Проект не найден'})
    const fields = ['status', 'inn', 'customer', 'manager', 'partner', 'distributor', 'emails', 'expiredDate']
    const body = await readBody(event)
    for (const f of fields) {
        project[f] = body[f]
    }
    await project.save()
}))

router.post('/create', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isServer) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const body = await readBody(event)
    return Project.create(body)
}))

router.post('/upload/:_id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isServer) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {_id} = event.context.params as Record<string, string>
    const project = await Project.findOne({_id, user})
    if(!project)  throw createError({statusCode: 404, message: 'Проект не найден',})
    let formData = await readMultipartFormData(event)
    if (!formData) return
    const file = await FileModel.create({user, name: formData[0].filename, mimetype: formData[0].type, size: formData[0].data.length})
    project.files.push(file)
    await project.save()
    const storage = useStorage("projects");
    const r = await storage.setItemRaw(file.fileName, formData[0].data);
}))

router.get('/file/:_id', defineEventHandler(async (event) => {
    const {_id} = event.context.params as Record<string, string>
    const file = await FileModel.findById(_id)
    if(!file) return
    event.node.res.setHeader('Content-Type', file.mimetype);
    event.node.res.setHeader("Content-Disposition", "attachment; filename=" + encodeURIComponent(file.name));
    const storage = useStorage("projects");
    return storage.getItemRaw(file.fileName)
}))

router.get('/excel/:_id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isServer) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {_id} = event.context.params as Record<string, string>
    const project = await Project.findOne({_id, user})
    if(!project)  throw createError({statusCode: 404, message: 'Проект не найден',})

}))

//Project.findById('674ed10e706c44002314a5ae').populate(Project.getPopulation()).then(console.log)

export default useBase('/api/project', router.handler)
