<script setup lang="ts">
import {storeToRefs} from "pinia";
import {useCustomStore} from "~/store/custom-store";
import ExcelButton from "~/components/spec/ExcelButton.vue";
import moment from 'moment'

const {loggedUser, settings} = storeToRefs(useCustomStore())

const filter = defineModel()
onMounted(() => {
  tableRef.value.requestServerInteraction()
})
const route = useRoute()
const columns = computed(() => {
  const headers = [
    {label: 'ИД', field: 'id', style: 'width:80px!important'},
    {label: 'Дата', field: 'date', style: 'width:150px!important'},
    {label: 'Название', field: 'name', style: 'width:150px!important'},
  ]
  if (route.query.specs === 'Общие')
    headers.push({label: 'От кого', field: 'shared', style: ''},)
  if (route.query.specs === 'Все')
    headers.push({label: 'User', field: 'user', style: ''})
  if (route.query.specs !== 'Все') {
    headers.push({label: 'Сумма, ' + loggedUser.value?.currency, field: 'price', style: ''})
  }
  headers.push({label: '', field: 'controls', style: ''})
  return headers.map((h: any) => ({...h, name: h.field}))
})
const paginationDefault = {rowsNumber: 0, rowsPerPage: 15, page: 1}
const pagination = ref(paginationDefault)
const tableRef = ref()
const loading = ref()
const defaultSearch = {id:'',date:'',name:'',shared:'',user:'',price:''}
const search = ref(defaultSearch)
const response = ref({specs: [], count: 0})
watch(() => filter.value, () => {
  search.value = {...defaultSearch}
  onRequest({pagination:paginationDefault})
})

async function onRequest(props: any) {
  const {page, rowsPerPage, sortBy, descending} = props.pagination
  loading.value = true
  const startRow = (page - 1) * rowsPerPage
  console.log(search.value)
  response.value = await useNuxtApp().$POST(`/spec/list?page=${startRow}&rowsPerPage=${rowsPerPage}`, [filter.value, search.value]) as {
    specs: never[],
    count: number
  }
  pagination.value.rowsNumber = response.value.count
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  loading.value = false
}

async function deleteSpec(id: string) {
  console.log(id)
  await useNuxtApp().$DELETE(`/spec/${id}`)
  await onRequest({pagination:paginationDefault})
}

async function cloneSpec(id: string) {
  await useNuxtApp().$GET(`/spec/${id}/clone`)
  await onRequest({pagination:paginationDefault})
}
</script>

<template lang="pug">
  div {{search}}
  q-table(
    v-if="response.specs"
    :rows="response.specs"
    :columns="columns"
    row-key="id"
    v-model:pagination="pagination"
    :loading="loading"
    ref="tableRef"
    @request="onRequest"
    no-data-label="Ни чего не найдено"
    @row-click="(e,row)=>navigateTo({query:{id:row.id}})"
    )
    template( v-slot:header)
      q-td(v-for="col of columns.filter(c=>!['controls', 'price', 'shared'].includes(c.field))")
        q-input(v-if="col.field!=='date'" v-model="search[col.field]" :label="col.label" @keyup.prevent="()=>onRequest({pagination})")
          template(v-slot:append)
            q-icon(name="mdi-magnify")
        div(v-else)
          q-btn( icon="mdi-clock" color="primary" :label="search.date")
            q-popup-proxy(cover transition-show="scale" transition-hide="scale")
              q-date(v-model="search[col.field]" mask="YYYY-MM-DD" @update:model-value="()=>onRequest({pagination})")
    template(v-slot:body-cell-controls="{row}")
      q-td
        ExcelButton(:spec="row.id")
        ExcelButton(:spec="row.id" :confidential="true")
        q-btn(icon="mdi-content-duplicate" @click.stop="cloneSpec(row.id)")
          q-tooltip Клонировать
        q-btn(v-if="row.user.id === loggedUser.id" icon="mdi-delete" color="negative" @click.stop)
          q-tooltip Удалить "{{row.name}}"
          q-popup-proxy(cover transition-show="scale" transition-hide="scale")
            q-banner Удалить конфигурацию "{{row.name}}"? &nbsp;
              q-btn( @click.stop="deleteSpec(row.id)" label="OK" v-close-popup color="negative" )
              q-btn( @click.stop label="Отмена" v-close-popup)
        q-icon(v-if="row.configurations.length" name="mdi-server-outline" color="orange" )
          q-tooltip Серверные конфигурации
        q-icon(v-if="row.orders.length" name="mdi-network-outline" outline color="green")
          q-tooltip Сетевые конфигурации
        //q-badge(v-if="row.configurations.length" color="orange" outline) SRV
        //q-badge(v-if="row.orders.length" color="green" outline) NET

    template(v-slot:body-cell-shared="{row}")
      q-td(style="width:150px") {{row.shared?.email}}
    template(v-slot:body-cell-user="{row}")
      q-td(style="width:150px") {{row.user?.email}}
    template(v-slot:body-cell-price="{row}")
      q-td(style="width:150px")
        div.text-right {{$priceFormat($priceByCurrencyServer(row.priceServer) + $priceByCurrencyServer(row.priceNet))}}
</template>

<style scoped>

</style>