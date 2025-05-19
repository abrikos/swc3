<script setup lang="ts">
const user = defineModel()
onMounted(load)
const roles = ref()
async function load(){
  roles.value = await useNuxtApp().$GET('/admin/roles')
}
const types = ['Дистрибутор', 'Партнер', 'Заказчик']
</script>

<template lang="pug">
  q-card.q-ma-sm
    q-card-section
      q-select(v-model="user.type" :options="types" label="Тип пользователя" )
      q-option-group(v-if="roles" :options="roles" option-label="name" option-value="id" v-model="user.roles" type="toggle")
</template>

<style scoped>

</style>