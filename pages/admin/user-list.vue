<script setup lang="ts">
import RoleForm from "~/components/user/RoleForm.vue";
import {storeToRefs} from "pinia";
import {useCustomStore} from "~/store/custom-store";

const {loggedUser} = storeToRefs(useCustomStore())
const list = ref()
const columns = [
  {field: 'email', label: 'Email'},
  {field: 'date', label: 'Зарегистрирован'},
  {field: 'loggedDate', label: 'Последний вход'},
  {field: 'specsCount', label: 'Спек'},
  {field: 'role', label: 'Роль'},
  {name: 'actions', label: ''},
].map(v => ({name: v.field, ...v}))
onMounted(load)

//const roles = ref()

async function load() {
  list.value = await useNuxtApp().$GET('/admin/list-all')
  //roles.value = await useNuxtApp().$GET('/admin/roles')
  user.value = {
    //roles: roles.value.filter((r: IRole) => ['user', 'External'].includes(r.name)),
    blocked: false,
    parent: loggedUser.value?.fio
    //email:'aa@aa.com', inn:'dfdfd', company:'dfds', firstName:'sdsd', lastName:'sdsd', middleName:'dfdfd', phone:'+79142635268'
  }
}

async function deleteUser(id: string) {
  await useNuxtApp().$DELETE(`/admin/user/delete/${id}`)
  await load()
}

async function updateUser(user: any) {
  await useNuxtApp().$POST(`/admin/user/update/${user.id}`, user)
  await load()
}

const filter = ref({role: '', email: ''})

const listFiltered = computed(
    () => list.value
        .filter((u: IUser) => u.email.match(filter.value.email))
        .filter((u: IUser) => filter.value.role ? u.role === filter.value.role : true)//(filter.value.email))
)

const addDialog = ref(false)
const user = ref()

const snackbar = useSnackbar();

async function addUser() {
  if (!user.value.role) {
    snackbar.add({type: 'error', text: 'Укажите роль'})
    return
  }
  const res = await useNuxtApp().$POST(`/admin/user/create`, user.value)
  if (res) {
    navigateTo({path: `/admin/user-edit/`, query: {id: res.id}})
  } else {
    snackbar.add({type: 'error', text: 'Ошибка создания пользователя'})
  }
}
const roles = ['admin','Internal','External'].map(r=>({label:r, value:r}))
</script>

<template lang="pug">
  q-btn(@click="addDialog = true; user={role:'External'}" color="primary" ) Создать пользователя
  q-dialog(v-model="addDialog" )
    q-card(v-if="user")
      q-toolbar
        q-toolbar-title Создать пользователя
      q-card-section
        q-form(v-if="user" ref="form" @submit="addUser")
          div.row
            div.col
              q-card.q-ma-sm
                q-card-section.flex.justify-between

                  UserForm(v-model="user" no-validations="1")
            div.col
              RoleForm(v-model="user")
              q-card.q-ma-sm
                q-card-section.flex.justify-between
                  q-toggle(v-model="user.blocked" label="Заблокирован" )
              q-card.q-ma-sm(v-if="user")
                q-card-section
                  q-input(v-model="user.password" label="Пароль")
          q-btn(type="submit" label="Создать" color="primary")

  q-input(v-model="filter.email" label="Поиск по e-mail" )
  q-option-group(v-model="filter.role" :options="roles"  inline )
  q-table(:rows="listFiltered" v-if="list" :columns="columns" @row-click="(e,row)=>navigateTo({path: '/admin/user-edit', query: {id:row.id}})" :pagination="{rowsPerPage:15}")
    template(v-slot:body-cell-roles="{row}")
      q-td {{row.roles.map(r => r.name)}}
    template(v-slot:body-cell-actions="{row}")
      q-td
        q-btn(:icon="row.blocked? 'mdi-account-cancel':'mdi-account'" :color="row.blocked? 'negative':'positive'" size="sm" round @click.stop="row.blocked=!row.blocked;updateUser(row)")

        q-btn(icon="mdi-delete" color="red" size="sm" round @click.stop)
          q-tooltip Удалить "{{row.email}}?"
          q-popup-proxy(cover transition-show="scale" transition-hide="scale")
            q-banner Удалить пользователя "{{row.email}}"? &nbsp;
              q-btn( @click.stop="deleteUser(row.id)" label="OK" v-close-popup color="negative" )
              q-btn( @click.stop label="Отмена" v-close-popup)

</template>

<style scoped>

</style>
