<script setup lang="ts">
import {storeToRefs} from "pinia";
import {useCustomStore} from "~/store/custom-store";

const {loggedUser, settings} = storeToRefs(useCustomStore())

const filter = defineModel()
onMounted(() => {
  tableRef.value.requestServerInteraction()
})
const route = useRoute()
const columns = computed(() => {
  const headers = [
    {label: 'ИД', field: 'id', width: '80px'},
    {label: 'Дата', field: 'date', width: '150px'},
    {label: 'Название', field: 'name'},
  ]
  if (route.query.specs === 'Общие')
    headers.push({label: 'От кого', field: 'shared'},)
  if (route.query.specs === 'Все')
    headers.push({label: 'User', field: 'user', width: '250px'})
  if (route.query.specs !== 'Все') {
    headers.push({label: 'Сумма, ' + loggedUser.value?.currency, field: 'price', width: '150px'})
  }
  headers.push({label: 'Тип', field: 'types', width: '110px'})
  headers.push({label: '', field: 'controls', width: '180px'})
  return headers.map((h: any) => ({...h, name: h.field}))
})
const pagination = {rowsNumber: 0, rowsPerPage: 10, page: 1}
const paginationModel = ref(pagination)
const tableRef = ref()
const loading = ref()
const response = ref({specs: [], count: 0})
watch(() => filter.value, () => {
  onRequest({pagination})
})

async function onRequest(props: any) {
  const {page, rowsPerPage, sortBy, descending} = props.pagination
  loading.value = true
  const startRow = (page - 1) * rowsPerPage
  response.value = await useNuxtApp().$POST(`/spec/list?page=${startRow}&rowsPerPage=${rowsPerPage}`, filter.value) as {
    specs: never[],
    count: number
  }
  paginationModel.value.rowsNumber = response.value.count
  paginationModel.value.page = page
  paginationModel.value.rowsPerPage = rowsPerPage
  loading.value = false
}

</script>

<template lang="pug">
  q-table(:rows="response.specs" :columns="columns" row-key="id" v-model:pagination="paginationModel" :loading="loading" ref="tableRef" @request="onRequest")
    template(v-slot:body-cell-shared="{row}")
      q-td {{row.shared?.email}}
    template(v-slot:body-cell-user="{row}")
      q-td {{row.user?.email}}
</template>

<style scoped>

</style>