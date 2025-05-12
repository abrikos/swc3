<script setup lang="ts">
const {params} = useRoute()
const data = await useNuxtApp().$POST(`/user/process-restore-password`, params)
</script>

<template lang="pug">
q-card.q-pa-lg.fixed-center
    q-card-section Новый пароль отправлен на указанный e-mail
</template>

<style scoped>

</style>
