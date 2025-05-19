<script setup lang="ts">
const user = defineModel<IUser>()
const companies = ref()

async function companyByInn() {
  companies.value = await useNuxtApp().$POST(`/user/inn`, user.value)
}
const check = ref()
async function checkEmail() {
  check.value = await useNuxtApp().$GET(`/user/check-email/${user.value?.email}`)
}

</script>

<template lang="pug">
  q-card.q-ma-sm
    q-card-section 7707083893 {{check}}
      q-input(v-model="user.email" label="E-mail" :rules="[$validateEmail]" @update:model-value="checkEmail" :disable="!!user.id")
      q-input(v-model="user.inn" label="ИНН" :rules="user.id ? [] : [$validateRequired]" @update:model-value="companyByInn" hint="")
      q-option-group(:options="companies" v-model="user.company" option-label="value" @update:model-value="companies=[]" hint="")
      q-input(v-model="user.company" label="Компания" :rules="user.id ? [] : [$validateRequired]" hint="")
      q-input(v-model="user.firstName" label="Фамилия" :rules="user.id ? [] : [$validateRequired]" hint="")
      q-input(v-model="user.lastName" label="Имя" :rules="user.id ? [] : [$validateRequired]" hint="")
      q-input(v-model="user.middleName" label="Отчество" :rules="user.id ? [] : [$validateRequired]" hint="")
      q-input(v-model="user.phone" label="Телефон" :rules="user.id ? [] : [$validateRequired]" hint="+7хххххххххх" hide-hint )
      q-input(v-model="user.parent" label="ФИО пригласившего сотрудника QTECH" :rules="user.id ? [] : [$validateRequired]" hint="")

</template>

<style scoped>

</style>