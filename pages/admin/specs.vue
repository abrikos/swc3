<script setup lang="ts">
const list = ref<ISpec[]>([])

async function load() {
  list.value = await useNuxtApp().$GET('/admin/specs') as ISpec[]
}

onMounted(load)
const columns = [
  {field: 'id', label: 'ID'},
  {field: 'date', label: 'Date'},
  {field: 'name', label: 'Name'},
  {field: 'user', label: 'User'},
]
const filter = ref()
</script>

<template lang="pug">
  q-input(v-model="filter" label="Поиск")
  q-table(:rows="list" :columns="columns" @row-click="(e,row)=>navigateTo('/servers/spec/'+row.id)" :filter="filter" :pagination="{rowsPerPage:20}")
</template>

<style scoped>

</style>