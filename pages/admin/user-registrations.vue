<script setup lang="ts">
const list = ref()
async function load(){
  list.value = await useNuxtApp().$GET('/admin/registrations')
}
onMounted(load)
const columns=[
  {field:'date', label:'Date'},
  {field:'fio', label:'FIO'},
  {field:'email', label:'E-mail'},
  {field:'controls'},
].map((v,i)=>({name:v.field, ...v}))

async function reject(id:string){
  await useNuxtApp().$POST(`/admin/registration/reject/${id}`)
  await load()
}

async function confirm(id:string) {
  const newUser = await useNuxtApp().$POST(`/admin/registration/confirm/${id}`) as IUser
  await load()
}

async function fake() {

    await useNuxtApp().$POST('/user/registration', {email: Math.random()+'@a.com', inn:'1', company:'1', firstName:'1', lastName:'1', middleName:'1', phone:'+79142365896', parent:'1'})
  await load()
}

</script>

<template lang="pug">
  q-btn(@click="fake" label="fake" )
  q-table(v-if="list" :rows="list" :columns="columns" :pagination="{rowsPerPage:15}" @row-click="(e,row)=>navigateTo({path:'/admin/user-confirm', query:{id:row.id}})")
    template(v-slot:body-cell-controls="{row}")
      q-td
        q-btn(icon="mdi-check" color="positive" rounded @click.stop="confirm(row.id)")
          q-tooltip Подтвердить
        q-btn(icon="mdi-cancel" color="negative" rounded @click.stop="reject(row.id)")
          q-tooltip Отказать в регистрации

</template>

<style scoped>

</style>