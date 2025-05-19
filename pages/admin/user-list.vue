<script setup lang="ts">
const list = ref()
const columns = [
  {field:'email',label:'Email'},
  {field:'date',label:'Зарегистрирован'},
  {field:'loggedDate',label:'Последний вход'},
  {field:'specsCount',label:'Спек'},
  {field:'roles',label:'Роли'},
  {name:'actions',label:''},
].map(v=>({name:v.field, ...v}))
onMounted(load)

const roles = ref()
async function load(){
  list.value = await useNuxtApp().$GET('/admin/list-all')
  roles.value = await useNuxtApp().$GET('/admin/roles')
}

async function deleteUser (id:string) {
  await useNuxtApp().$DELETE(`/admin/user/delete/${id}`)
  await load()
}

async function updateUser(user:any){
  console.log(user.blocked)
  await useNuxtApp().$POST(`/admin/user/update/${user.id}`, user)
  await load()
}
const filter = ref({role:'', email:''})

const listFiltered = computed(
    () => list.value
        .filter((u:IUser)=>u.email.match(filter.value.email))
        .filter((u:IUser)=>filter.value.role ? u.roles.map((r:IRole)=>r.id).includes(filter.value.role):true)//(filter.value.email))
)
</script>

<template lang="pug">
  q-input(v-model="filter.email" label="Поиск по e-mail" )
  q-option-group(v-if="roles" v-model="filter.role" :options="roles" option-value="id" option-label="name" inline )
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
