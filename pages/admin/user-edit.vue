<script setup lang="ts">
import RoleForm from "~/components/user/RoleForm.vue";

const route = useRoute()
onMounted(load)
const user = ref()
const snackbar = useSnackbar();

async function load() {
  user.value = await useNuxtApp().$GET(`/admin/user/${route.query.id}`)
}

async function submit() {
  const res = await useNuxtApp().$POST(`/admin/user/update/${user.value.id}`, user.value)
  if(res?.id) {
    user.value.password = ''
    snackbar.add({type: 'success', text: 'Сохранено'})
  }else{
    snackbar.add({type: 'error', text: 'Ошибка сохранения'})
  }
}

const password = ref()
const password2 = ref()

</script>

<template lang="pug">
  div.h1 Редактирование пользователя
  q-form(v-if="user" ref="form" @submit="submit")
    div.row
      div.col
        UserForm(v-model="user")
      div.col
        RoleForm(v-model="user")
        q-card.q-ma-sm
          q-card-section.flex.justify-between
            q-toggle(v-model="user.blocked" label="Заблокирован" )
        q-card.q-ma-sm(v-if="user")
          q-card-section
            q-input(v-model="user.password" label="Пароль")

        q-card.q-ma-sm
          q-card-section.flex.justify-between
            q-btn(type="submit" label="Сохранить" color="primary" )
</template>

<style scoped>

</style>