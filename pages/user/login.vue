<script setup lang="ts">
import {useCustomStore} from '~/store/custom-store';

const {loggedUser, authenticateUser} = useCustomStore()
const config = useRuntimeConfig()

const user = ref({email: '', password: ''})

async function submit() {
  await authenticateUser(user.value)
}
onMounted(()=>{
  if(loggedUser) {navigateTo('/user')}
})

function reset() {
  user.value = {email: '', password: ''}
}
</script>

<template lang="pug">
q-card.q-pa-sm.fixed-center
  q-toolbar
    q-toolbar-title Вход
  q-form(@submit="submit" @reset="reset")
    q-input(v-model="user.email" label="Логин")
    br
    q-input(v-model="user.password" label="Пароль" type="password" )
    q-card-actions
      q-btn(type="submit" label="Отправить" color="primary" :flat="false")
      q-btn(type="reset" label="Сбросить")
</template>

<style scoped>

</style>
