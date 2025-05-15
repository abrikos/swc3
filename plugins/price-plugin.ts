import {useCustomStore} from "~/store/custom-store";
import {storeToRefs} from "pinia";


export default defineNuxtPlugin(() => {
    const {loggedUser, settings} = storeToRefs(useCustomStore())
    return {
        provide: {
            priceByCurrencyServer: (value: number) => {
                const course = settings.value?.course
                if(!course) return 0
                return value * (loggedUser.value?.currency !== 'USD' ? course : 1)
            },
            priceByCourseNet: (value: number) => {
                const course = settings.value?.course
                if(!course) return 0
                return value * (loggedUser.value?.currency === 'USD' ? 1 / course : 1)
            },
            priceFormat: (value: number) => {
                return value.toFixed(2).replace(/(\d)(?=(\d{3})+([^\d]|$))/g, '$1 ');
            }
        }
    }
})