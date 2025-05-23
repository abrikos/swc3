<script setup lang="ts">
import {storeToRefs} from "pinia";
import {useCustomStore} from "~/store/custom-store";
import CloneButton from "~/components/spec/CloneButton.vue";

const {$priceFormat, $priceByCurrencyServer, $priceByCurrencyNet} = useNuxtApp()
const {loggedUser, settings} = storeToRefs(useCustomStore())
const route = useRoute()
const columns = computed(() => {
  const headers = [
    {label: 'ИД', field: 'id', style: 'width:80px!important'},
    {label: 'Дата', field: 'date', style: 'width:150px!important'},
    {label: 'Название', field: 'name', style: 'width:150px!important'},
    {label: 'От кого', field: ((row: any) => row.shared?.email) as unknown as string, style: ''},
    {
      label: 'Сумма, ' + loggedUser.value?.currency,
      field: ((row: any) => $priceFormat($priceByCurrencyServer(row.priceServer) + $priceByCurrencyNet(row.priceNet))) as unknown as string,
      style: 'text-align: right; width:150px',
    },
    {label: '', field: 'controls', style: ''}
  ]
  return headers.map((h: any) => ({...h, name: h.field}))
})
const loading = ref()
const rows = ref([])

async function load() {
  loading.value = true
  rows.value = await useNuxtApp().$GET(`/spec/list`) as never[]
  loading.value = false
}

onMounted(load)

const search = ref('')

</script>

<template lang="pug">
  q-input(v-model="search" label="Поиск" )
    template(v-slot:append)
      q-icon(name="mdi-magnify")
  q-table(
    :rows="rows"
    :columns="columns"
    row-key="id"
    :filter="search"
    @row-click="(e,row)=>navigateTo(`/servers/spec/${row.id}`)"
    :pagination="{rowsPerPage:20}"
    :table-row-class-fn="()=>'row2'"
  )
    template(v-slot:body-cell-controls="{row}")
      q-td
        ExcelButton(:id="row.id" path="/spec" )
        ExcelButton(:id="row.id" :confidential="true" path="/spec" )
        CloneButton(:spec="row.id")
        DeleteButton(:id="row.id" path="/spec" :name="row.name" event="specs:reload" )

        q-icon(v-if="row.configurations.length" name="mdi-server-outline" color="orange" )
          q-tooltip Серверные конфигурации
        q-icon(v-if="row.orders.length" name="mdi-network-outline" outline color="green")
          q-tooltip Сетевые конфигурации
        //q-badge(v-if="row.configurations.length" color="orange" outline) SRV
        //q-badge(v-if="row.orders.length" color="green" outline) NET


</template>

<style scoped lang="sass">
.row2
  background-color: red

</style>