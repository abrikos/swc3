<script setup lang="ts">
import RoleForm from "~/components/user/RoleForm.vue";

const route = useRoute()
onMounted(load)
const user = ref()

async function load() {
  user.value = await useNuxtApp().$GET(`/admin/registration/${route.query.id}`)
}

async function submit() {
  return
  const newUser = await useNuxtApp().$POST(`/admin/registration/confirm/${user.value.id}`, user.value) as IUser
  if(!newUser?.id) return
  navigateTo({path: '/admin/user-edit', query: {id: newUser?.id}})
}

async function reject() {
  await useNuxtApp().$POST(`/admin/registration/reject/${user.value.id}`)
  navigateTo({path: '/admin/user-registrations'})
}
</script>

<template lang="pug">
  div.h1 Подтверждение регистрации нового пользователя
  Banner(v-if="!user" color="warning") Заявка на регистрацию не найдена. Возможно она уже подтверждена
  q-form(v-else ref="form" @submit="submit")
    div.row
      div.col
        UserForm(v-model="user" :submit="submit")
      div.col
        RoleForm(v-model="user")
        q-card.q-ma-sm
          q-card-section.flex.justify-between
            q-btn(type="submit" label="Подтвердить" color="primary" )
            q-btn(label="Отказать" color="negative" @click="reject")
</template>

<style scoped>

</style>