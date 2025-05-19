import {Settings} from "~/server/models/settings.model";

export default defineEventHandler(async (event) => {
    return Settings.findOne().select('course')
})