<script setup lang="ts">
import moment from "moment";
const {$priceFormat, $priceByCurrencyServer, $priceByCurrencyNet} = useNuxtApp()
const columns = [
  {label:'Дата',field:'date'},
  {label:'Заказчик',field:'customer'},
  {label:'Менеджер',field:(row:any)=>row.manager?.name},
  {label:'Статус',field:'status'},
  {label:'Срок',field:'end'},
  {label:'Сумма',field:((row: any) => $priceFormat($priceByCurrencyServer(row.priceServer) + $priceByCurrencyNet(row.priceNet))), style:'text-align:right'},
  {label:'',field:'controls'},
].map(i=>({...i, name:i.field}))
const rows = ref<IProject[]>([])
async function load(){
  rows.value = await useNuxtApp().$GET('/project/list') as IProject[]
}
onMounted(load)
const filter = ref('')

function formatDate(date:string) {
  return date ? moment(date).format('YYYY-MM') : ''
}

</script>

<template lang="pug">
q-input(v-model="filter" label="Поиск" )
  template(v-slot:append)
    q-icon(name="mdi-magnify")
q-table(:rows="rows" :columns="columns" :filter="filter" :pagination="{rowsPerPage:20}" @row-click="(e,row)=>navigateTo(`/project/${row.id}`)")
  template(v-slot:body-cell-status="{row}")
    q-td
      q-badge(:label="row.status" :color="row.status==='Не успешный'?'red':row.status==='Успешный'?'green':'grey'")
  template(v-slot:body-cell-end="{row}")
    q-td {{formatDate(row.expireDate)}}
      q-badge(v-if="row.expiredDays>30"  color="red") Просрочен
      q-badge(v-if="!row.expiredDays") Нет даты
  template(v-slot:body-cell-controls="{row}")
    q-td
      DeleteButton(event="projects:reload" path="project" :id="row.id" :name="row.name" )
</template>

<style scoped>

</style>