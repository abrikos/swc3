<script setup lang="ts">
import {useCustomStore} from '~/store/custom-store';

const {signupUser} = useCustomStore()
const config = useRuntimeConfig()
const testuser ={email: Math.random()+'@a.com', inn:'1', company:'1', firstName:'1', lastName:'1', middleName:'1', phone:'+79142365896', parent:'1'}
const user = ref(config.app.buildId==='dev' ? testuser: {})
const form = ref()
const snackbar = useSnackbar()

const res = ref(true)
async function submit() {
  if(await form.value.validate()) {
    const res = await useNuxtApp().$POST('/user/registration', user.value)
    if(!res?.error) {
      navigateTo('/user/registration-done')
    }else{
      snackbar.add({type: 'error', text: res.error})
    }

  }
}

</script>

<template lang="pug">
  q-form(v-if="user" ref="form" @submit="submit")
    q-card.q-ma-sm(style="width:400px")
      q-card-section
        div.h1 Регистрация
      q-card-section
        UserForm(v-model="user")
      q-card-actions
        q-btn(type="submit" label="Отправить" )

</template>

<style scoped>

</style>
