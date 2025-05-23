import {defineStore} from 'pinia';
import type {ISettings} from "~/server/models/settings.model";


interface UserPayloadInterface {
    email: string;
    password: string;

}

export const useCustomStore = defineStore('auth', {
    state: (): { loading: boolean, loggedUser: IUser | undefined, redirect: string, settings: ISettings|undefined } => ({
        loggedUser: undefined,
        loading: false,
        redirect: '',
        settings: undefined,
    }),
    actions: {
        setRedirect(path: string) {
            this.redirect = path
        },
        setLoading() {
            this.loading = true
        },
        unsetLoading() {
            this.loading = false
        },
        async getUser(): Promise<IUser | undefined> {
            if (!this.loggedUser) {
                this.loggedUser = await useNuxtApp().$GET('/user/checkAuth') as IUser;
            }
            return this.loggedUser
        },
        async getSettings(){
            this.settings = await useNuxtApp().$GET('/usd-course') as ISettings
            return this.settings
        },
        async authenticateUser(body: UserPayloadInterface) {
            const config = useRuntimeConfig()
            const data: any = await useNuxtApp().$POST(`/user/login`, body)
            if (!data) return
            this.loggedUser = data
            navigateTo(this.redirect)
        },
        async signupUser(body: UserPayloadInterface) {
            const config = useRuntimeConfig()
            const data: any = await useNuxtApp().$PUT(`/user/signup`, body)
            if (!data) return
            this.loggedUser = await this.getUser()
            navigateTo('/')
        },
        async logUserOut() {
            await useNuxtApp().$GET(`/user/logout`)
            this.loggedUser = undefined
            navigateTo('/user/login')
        },

    },
});
