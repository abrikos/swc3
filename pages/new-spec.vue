<script setup lang="ts">
import OrderBasket from "~/components/order/OrderBasket.vue";
import NetworkCategories from "~/components/order/NetworkCategories.vue";
import DeviceTable from "~/components/order/DeviceTable.vue";
const items = ref<{device:IDevice, count:number}[]>([])
function handler(e){
  navigateTo({path:"/servers/chassis", query:{platform:e.name}})
}
const tabsList = [
  {label: 'Intel Gen2', name: 'G2', handler},
  {label: 'Intel Gen3', name: 'G3', handler},
  {label: 'AMD', name: 'AMD', handler},
  {label: 'Дисковые полки (JBOD)', name: 'JBOD', handler},
  {label: 'Intel Gen2R', name: 'G2R', handler},
  {label: 'Intel Gen3R', name: 'G3R', handler},
  {label: 'Intel Gen4', name: 'G4', handler},
]

const tree = [{
  label: 'Сервера',
  selectable: true,
  children: tabsList
}]
</script>

<template lang="pug">
  div.row
    div.col-3-sm.q-px-sm
      //DeviceChoose(v-model="items")
      q-tree(:nodes="tree" node-key="label")
      NetworkCategories
    div.col-sm
      DeviceTable(v-model="items" )

    div.col-sm.q-px-sm
      OrderBasket(v-model="items")

</template>

<style scoped lang="sass">
div
  cursor: pointer
</style>