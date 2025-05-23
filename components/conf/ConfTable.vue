<script setup lang="ts">
import componentCount from "~/plugins/logic/logic-counts";
const {$event} = useNuxtApp()
const route = useRoute()
const {conf, components} = defineProps({
  conf: {type:Object, required:true},
  components: {type:Object, required:true},
})
const {$confComponents, $priceByCurrencyServer, $priceFormat} = useNuxtApp()
const columns = [
  { field: 'partNumber', label: 'Артикул'},
  { field: 'description', label: 'Наименование'},
  { field: 'price', label: 'Цена'},
  { field: 'count', label: 'Количество', width: 25},
].map(item => {
  item.name = item.field
  return item
})
const componentsCurrent = computed(()=>$confComponents(conf, components, route.query).map((x:any)=>({...x, count:calcCount(x)})))

function calcCount(item:any) {
  const part = conf.parts.find(p => p.component.id === item.id)
  return part ? part.count : 0
}

async function addPart(e:any, item:any){
  await useNuxtApp().$POST(`/conf/component-count/${conf.id}`, [item.id,e.target.value])
  $event('conf:reload')
}

const rowClassFn = (row:any)=>row.count>0 ? 'selected' : ''


</script>

<template lang="pug">
  q-table(:rows="componentsCurrent" :columns="columns" row-key="id" :pagination="{rowsNumber:100, rowsPerPage:100}" :table-row-class-fn="rowClassFn")
    template(v-slot:body-cell-count="{row}")
      q-td
        select(v-if="!(row.countDisabled && !calcCount(row))" @change="(e)=>addPart(e,row)")
          option(v-for="val of componentCount(conf, route.query)" :value="val" :selected="val===calcCount(row)") {{val}}
        div(v-else) Доступна только 1 позиция
    template(v-slot:body-cell-price="props")
      q-td {{$priceFormat($priceByCurrencyServer(props.row.price))}}
</template>

<style scoped lang="sass">
.selected
  background-color: red
</style>