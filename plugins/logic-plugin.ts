import confComponents from "./logic/logic-components"
import confValidator from "./logic/logic-validator"
import confComponentCount from "./logic/logic-counts"
export default defineNuxtPlugin(() => {
    return {
        provide: {
            confComponents,
            confValidator,
            confComponentCount
        }
    }
})