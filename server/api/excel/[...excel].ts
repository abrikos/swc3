import {specToXls} from "~/server/utils/excel/excel";
import {projectToXls} from "~/server/utils/excel/excel-project";
import moment from "moment";
import mongoose from "mongoose";

const router = createRouter()



router.get('/spec/:_id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isServer) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {_id} = event.context.params as Record<string, string>
    const spec = await Spec.findOne({_id, user}).populate(Spec.getPopulation())
    if (!spec) throw createError({statusCode: 404, message: ('Конфигурация не найдена'),})
    const {confidential} = getQuery(event)
    event.node.res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    event.node.res.setHeader("Content-Disposition", "attachment; filename=" + encodeURIComponent(spec.name) + (confidential !== '0' ? '-confidential' : '') + ".xlsx");
    const settings = await Settings.findOne()
    return specToXls(spec, user, user.isAdmin && confidential !== '0', settings?.course || 0)
}))

router.get('/project/:_id', defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || !user.isServer) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    const {_id} = event.context.params as Record<string, string>
    const {confidential} = getQuery(event)
    const project = await Project.findOne({_id, user}).populate(Project.getPopulation())
    if (!project) throw createError({statusCode: 404, message: ('Проект не найден'),})
    event.node.res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    event.node.res.setHeader("Content-Disposition", "attachment; filename=" + encodeURIComponent(project.name) + (confidential !== '0' ? '-confidential' : '')  + ".xlsx");
    const settings = await Settings.findOne()
    return projectToXls(project, user, user.isAdmin && confidential !== '0', settings?.course || 0)
}))

export default useBase('/api/excel', router.handler)
