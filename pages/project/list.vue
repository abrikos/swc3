<script setup lang="ts">
import moment from "moment";

const {$priceFormat, $priceByCurrencyServer, $priceByCurrencyNet} = useNuxtApp()
const columns = [
  {label: 'Дата', field: 'date'},
  {label: 'Заказчик', field: 'customer'},
  {label: 'Менеджер', field: (row: any) => row.manager?.name},
  {label: 'Статус', field: 'status'},
  {label: 'Срок', field: 'end'},
  {
    label: 'Сумма',
    field: ((row: any) => $priceFormat($priceByCurrencyServer(row.priceServer) + $priceByCurrencyNet(row.priceNet))),
    style: 'text-align:right'
  },
  {label: '', field: 'controls'},
].map(i => ({...i, name: i.field}))
const rows = ref<IProject[]>([])

async function load() {
  rows.value = await useNuxtApp().$GET('/project/list') as IProject[]
}

onMounted(load)
const filter = ref('')
const project = ref({})
const createDialog = ref(false)

function formatDate(date: string) {
  return date ? moment(date).format('YYYY-MM') : ''
}

async function create(){
  const p = await useNuxtApp().$POST('/project/create', project.value) as IProject
  if(!p) return
  navigateTo(`/project/${p.id}`)
}

const rowsSorted = computed(()=>rows.value.sort((a, b) => a.expiredDays > 30 ? -1 : 0))

</script>

<template lang="pug">
  q-toolbar
    q-toolbar-title Проекты
    q-input(v-model="filter" label="Поиск" )
      template(v-slot:append)
        q-icon(name="mdi-magnify")
    q-space
    q-btn(label="Создать проект" @click="createDialog=true")
  q-dialog(v-model="createDialog" )
      ProjectForm(v-model="project" :submit="create")

  q-table(:rows="rowsSorted" :columns="columns" :filter="filter" :pagination="{rowsPerPage:20}" @row-click="(e,row)=>navigateTo(`/project/${row.id}`)" :table-row-class-fn="(row)=>row.expiredDays>30?'text-red':''")
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