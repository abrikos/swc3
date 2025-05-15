<script setup lang="ts">
import {storeToRefs} from 'pinia'; // import storeToRefs helper hook from pinia
import {useCustomStore} from '~/store/custom-store';

const config = useAppConfig()
const route = useRoute()
const {logUserOut, getSettings} = useCustomStore(); // use authenticateUser action from  auth store
const {loggedUser} = storeToRefs(useCustomStore())
await getSettings()
const leftDrawerOpen = ref(true);
const pages = [
  {to: '/network/choose', label: 'Сетевое оборудование', icon: 'language'},
  {to: '/servers/chassis', label: 'Сервера', icon: 'catching_pokemon'},
  {to: '/servers/specs', label: 'Спецификации', icon: 'settings'},
]
</script>

<template lang="pug">
  q-layout(view="hHh Lpr lff")
    NuxtLoadingIndicator
    q-header
      q-toolbar.bg-grey-6(inset)
        img(src="/logo.png" style="max-height: 20px;max-width: 230px")
        //q-btn(v-if="loggedUser" flat round dense icon="menu" @click="toggleDrawer")
        q-toolbar-title
          q-btn(flat to="/")
        CurrencySwitch
        //q-btn-dropdown(flat label="Admin" v-if="loggedUser?.isAdmin")
          q-list
            q-item
              q-btn(to="/admin/users" label="Пользователи")
            q-item
              q-btn(to="/admin/import" label="Импорт")
        q-space
        q-btn.flex.la-align-center(flat dense no-caps v-if="loggedUser" to="/user") {{loggedUser.email}}
        q-btn(v-if="loggedUser" @click="logUserOut" icon="logout" )
        q-btn(v-if="!loggedUser" to="/login" icon="login" )
        //ThemeSwitch
    q-drawer(v-model="leftDrawerOpen" bordered)

      q-list
        q-item(v-for="page in pages" :to="page.to" active-class="active" :active="route.fullPath===page.to || route.path===page.to")
          q-item-section(avatar)
            q-icon(:name="page.icon")
          q-item-section {{page.label}}
      //div#progress
        q-linear-progress(color="blue" indeterminate v-if="loading" )

    q-page-container {{route.name}}
      slot


</template>

<style scoped>

</style>
