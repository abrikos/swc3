import {useCustomStore} from '~/store/custom-store';
import {storeToRefs} from "pinia"; // import the auth store we just created
export default defineNuxtRouteMiddleware(async (to, from) => {
    const {getUser, setRedirect, redirect} = useCustomStore();
    const {$event} = useNuxtApp()
    $event('login:close')
    const {guestPages} = useAppConfig()
    const loggedUser = await getUser()
    console.log(to, from, redirect)
    if (!guestPages.includes(to.name as string) && !loggedUser) {

        setRedirect(to.fullPath)
        //abortNavigation();
        return navigateTo('/login');
    }
});