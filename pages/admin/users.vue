<script setup lang="ts">
const list = ref()
const columns = [
  {field:'email',label:'Email'},
  {name:'actions',label:''},
]
onMounted(load)

async function load(){
  list.value = await useNuxtApp().$GET('/user/list-all')
}
async function deleteUser (user:any) {
  if(!confirm('Удалить пользователя ' + user.email)) return
  await useNuxtApp().$DELETE(`/user/${user.id}`)
  await load()
}

async function updateUser(user:any){
  await useNuxtApp().$GET(`/user/${user.id}/toggle-admin`)
  await load()
}

</script>

<template lang="pug">
q-table(:rows="list" v-if="list" :columns="columns")
  template(v-slot:body-cell-actions="props")
    q-td(:props="props")
      q-checkbox(v-model="props.row.isAdmin" @update:model-value="updateUser(props.row)" label="Админ" )
      q-btn(icon="delete" @click="deleteUser(props.row)" color="red" )
</template>

<style scoped>

</style>
