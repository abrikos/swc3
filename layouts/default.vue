<script setup lang="ts">
import {storeToRefs} from 'pinia'; // import storeToRefs helper hook from pinia
import {useCustomStore} from '~/store/custom-store';
import ThemeSwitch from "~/components/ThemeSwitch.vue";
import {useCookie} from "#app";

const config = useAppConfig()
const route = useRoute()
const {logUserOut, getSettings} = useCustomStore(); // use authenticateUser action from  auth store
const {loggedUser, loading} = storeToRefs(useCustomStore())
const themeWidth = useCookie<string>('themeWidth');
const drawerSide = useCookie<string>('drawerSide');
await getSettings()
const leftDrawerOpen = ref(true);
const pages = ref()

const pagesAdmin = [
  {to: '/admin/user-registrations', label: 'Заявки на регистрацию', icon: 'mdi-account-alert-outline'},
  {to: '/admin/import', label: 'Импорт данных', icon: 'mdi-import'},
  {to: '/admin/services', label: 'Список сервисов тех-поддержки SRV', icon: 'mdi-room-service-outline'},
  {to: '/admin/user-list', label: 'Список пользователей', icon: 'mdi-text-account'},
  {to: '/admin/specs', label: 'Все спеки', icon: 'mdi-list-box-outline'},
  {to: '/admin/log', label: 'Лог действий', icon: 'mdi-security'},

]
const version = ref()
onMounted(()=>{
  useNuxtApp().$GET('/git-commit').then((res)=>{
    version.value = res;
  })
  pages.value = [
    //{to: '/', label: 'Начало', icon: 'mdi-home'},
    {to: '/new-spec', label: 'Создать спецификацию', icon: 'mdi-new-box', showItem: true},
    {to: '/network/choose', label: 'Сетевое оборудование', icon: 'mdi-network-outline', hideForExternal: true},
    {to: '/servers/chassis', label: 'Серверы', icon: 'mdi-server-outline', showItem: true},
    {to: '/servers/spec/list', label: 'Спецификации', icon: 'mdi-list-box-outline', showItem: true},
    {to: '/project/list', label: 'Проекты', icon: 'mdi-briefcase-outline', showItem: true},
    {to: '/user/login', label: 'Вход', icon: 'mdi-account', showItem: false},
    {to: '/user/registration', label: 'Зарегистрироваться', icon: 'mdi-account-plus', showItem: false},
    {to: '/user/password-restore', label: 'Восстановить пароль', icon: 'mdi-form-textbox-password', showItem: false},
  ]
})
</script>

<template lang="pug">
  q-layout(view="hHh Lpr lff")
    q-header
      q-linear-progress#progress(color="orange" indeterminate v-if="loading" )
      q-toolbar.bg-grey-6
        q-btn( flat @click="leftDrawerOpen = !leftDrawerOpen" round dense icon="mdi-menu")
        img(src="/logo.png" style="max-height: 20px;max-width: 230px;cursor:pointer" @click="navigateTo('/')")
        //q-btn(v-if="loggedUser" flat round dense icon="menu" @click="toggleDrawer")
        q-toolbar-title
          //q-btn(to="/")
        CurrencySwitch

        //q-btn-dropdown(flat label="Admin" v-if="loggedUser?.isAdmin")
          q-list
            q-item
              q-btn(to="/admin/users" label="Пользователи")
            q-item
              q-btn(to="/admin/import" label="Импорт")
        q-space
        q-btn.flex.la-align-center(flat dense no-caps v-if="loggedUser" to="/user/cabinet") {{loggedUser.email}}
        q-btn(v-if="loggedUser" @click="logUserOut" icon="mdi-logout" )
        //q-btn(v-if="!loggedUser" to="/user/login" icon="mdi-login" )
        //ThemeSwitch
    q-drawer(v-model="leftDrawerOpen" bordered :side="drawerSide || 'left'")
      div {{drawerSide}}
      q-list
        //q-item(to="http://srvgfg.qtech.ru:8080")
          q-item-section Старая версия
        div(v-for="page in pages")
          q-item(:to="page.to" v-if="page.hideForExternal ? loggedUser?.isNetwork : true" )
            q-item-section(avatar)
              q-icon(:name="page.icon")
            q-item-section {{page.label}}

        div(v-if="loggedUser?.isAdmin")
          //q-separator
          q-item
            q-item-section
              i Служебный раздел:
          q-item(v-for="page in pagesAdmin" :to="page.to" active-class="active" :active="route.fullPath===page.to || route.path===page.to")
            q-item-section(avatar)
              q-icon(:name="page.icon")
            q-item-section {{page.label}}
        q-item
          q-item-section
            i Настройки
        ThemeSwitch
      small.text-caption(v-if="loggedUser?.isAdmin")
        div Last update:
        div {{version}}
    q-page-container(:class="themeWidth?'page-wrapper':''" )
      q-page
        slot


</template>

<style scoped lang="sass">
.page-wrapper
  max-width: 1600px
  margin: auto
#progress
  position: absolute
  height: 10px
  z-index: 100000000
</style>
