<script setup lang="ts">
import {storeToRefs} from 'pinia'; // import storeToRefs helper hook from pinia
import {useCustomStore} from '~/store/custom-store';

const config = useAppConfig()
const route = useRoute()
const {logUserOut, getSettings} = useCustomStore(); // use authenticateUser action from  auth store
const {loggedUser, loading} = storeToRefs(useCustomStore())
await getSettings()
const leftDrawerOpen = ref(true);
const pages = [
  {to: '/', label: 'Начало', icon: 'mdi-home'},
  {to: '/network/choose', label: 'Сетевое оборудование', icon: 'mdi-network-outline', forLogged: true},
  {to: '/servers/chassis', label: 'Сервера', icon: 'mdi-server-outline', forLogged: true},
  {to: '/servers/spec/list', label: 'Спецификации', icon: 'mdi-list-box-outline', forLogged: true},
]
const pagesAdmin = [
  {to: '/admin/user-registrations', label: 'Заявки на регистрацию', icon: 'mdi-account-alert'},
  {to: '/admin/user-list', label: 'Список пользователей', icon: 'mdi-text-account'},
  {to: '/admin/import', label: 'Импорт данных', icon: 'mdi-import'},
]
</script>

<template lang="pug">
  q-layout(view="hHh Lpr lff")
    q-header
      q-linear-progress#progress(color="orange" indeterminate v-if="loading" )
      q-toolbar.bg-grey-6
        q-btn( flat @click="leftDrawerOpen = !leftDrawerOpen" round dense icon="mdi-menu")
        img(src="/logo.png" style="max-height: 20px;max-width: 230px")
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
        q-btn(v-if="!loggedUser" to="/user/login" icon="mdi-login" )
        //ThemeSwitch
    q-drawer(v-model="leftDrawerOpen" bordered)
      q-list
        q-item(v-for="page in pages" :to="page.to")
          q-item-section(avatar)
            q-icon(:name="page.icon")
          q-item-section {{page.label}}
        div(v-if="loggedUser?.isAdmin")
          q-separator
          q-item.bg-grey-3
            q-item-section
              i Служебный раздел:
          q-item(v-for="page in pagesAdmin" :to="page.to" active-class="active" :active="route.fullPath===page.to || route.path===page.to")
            q-item-section(avatar)
              q-icon(:name="page.icon")
            q-item-section {{page.label}}

    q-page-container
      div {{route.name}}
      slot


</template>

<style scoped lang="sass">
#progress
  position: absolute
  height: 10px
  z-index: 100000000
</style>
