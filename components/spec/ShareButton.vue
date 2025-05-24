<script setup lang="ts">
const snackbar = useSnackbar();
const {spec}=defineProps({
  spec:{type:String, required: true},
})
const emails = ref()
const emailsArray = computed(()=>emails.value?.split(/[\n\s]/).filter((s:string)=>!!s))
async function share(){
  const res = await useNuxtApp().$POST(`/spec/share/${spec}`, emailsArray.value) as any[]
  snackbar.add({
    title: 'Ok',
    type: 'success',
    text: `Отправлено для: ${res.join(', ')}`
  })
}
</script>

<template lang="pug">
q-btn(icon="mdi-share" round)
  q-tooltip Поделиться
  q-popup-proxy.q-pa-sm
    q-input(v-model="emails" hint="Разделитель - новая строка, пробел" label="E-mails" type="textarea" )
    q-badge.q-ma-sm(v-for="email in emailsArray") {{email}}
    br
    q-btn(label="Отправить" v-close-popup color="primary" @click="share")
</template>

<style scoped>

</style>