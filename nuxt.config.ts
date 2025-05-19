// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-11-01',
    ssr: false,
    devtools: {enabled: false},
    modules: ['@nuxt/fonts', '@nuxt/icon', '@nuxt/image', '@pinia/nuxt', 'nuxt-quasar-ui', 'nuxt-mongoose', 'nuxt-snackbar'],
    mongoose: {
        uri: process.env.MONGODB_URI,
        options: {},
        modelsDir: 'models',
    },
    runtimeConfig: {
        mailUserQ: process.env.QTECH_MAIL_USER,
        mailPasswordQ: process.env.QTECH_MAIL_PASSWORD,
        mailUser: process.env.MAIL_USER,
        mailPassword: process.env.MAIL_PASSWORD,
        devMode: process.env.NODE_ENV !== 'production',
        public: {
            devMode: process.env.NODE_ENV !== 'production',
            authExpiration: 3600 * 24 * 30,
            authRefreshBeforeExpiration: 3000,
            authTokenName: 'auth_token',
        }
    },
    debug: false,
    snackbar: {
        bottom: true,
        right: true,
        duration: 5000
    },
    quasar: {
        sassVariables: '~/public/quazar.variables.sass',
        components: {
            defaults: {
                QCard:{
                    flat: true,
                    bordered: true
                },
                QBtn: {
                    dense: true,
                    flat: true,
                    noCaps: true
                },
                QSelect: {
                    outlined: true,
                    dense: true
                },
                QInput: {
                    outlined: true,
                    dense: true
                }
            }
        },
        iconSet: 'mdi-v7',
        lang: 'ru'

    },
    nitro: {
        storage: {
            uploads: {
                driver: "fs",
                base: "./public/chassis",
            },
        },
    },
})