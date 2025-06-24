<script setup lang="ts">
const user = defineModel()
onMounted(load)
const roles = ref()
async function load(){
  roles.value = await useNuxtApp().$GET('/admin/roles')
  user.value.roles = user.value.roles.map(item => item.id)
}
const types = ['Сотрудник','Дистрибутор', 'Партнер', 'Заказчик']
</script>

<template lang="pug">
  q-card.q-ma-sm
    q-card-section
      q-select(v-model="user.type" :options="types" label="Тип пользователя" :rules="[$validateRequired]" )
      div.hidden {{user.roles}}
      q-option-group(v-if="roles" :options="roles" option-label="name" option-value="id" v-model="user.roles" type="toggle" :rules="[$validateRequired]")
</template>

<style scoped>

</style>