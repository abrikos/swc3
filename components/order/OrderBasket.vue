<script setup lang="ts">
const items = defineModel<{device:IDevice, count:number}[]>()
function removeDevice(item:any){
  items.value = items.value?.filter((i:any) => i.device.id !== item.device.id)
}

const itemsNotZeroCount = computed(()=>items.value?.filter((i:any) => i.count))

function filterZero(item:any){
  items.value = items.value?.filter((i:any) => i.count!==0)
}

</script>

<template lang="pug">
table
  tbody
    tr
      th Наименование
      th Количество
      th Сумма
      th
    tr(v-for="item of items" :key="item.id")
      td {{ item.device.name }}
      td(width="50")
        q-input(v-model.number="item.count" type="number" min="0" @update:model-value="filterZero(item)")
      td.text-right {{$priceFormat($priceByCurrencyNet(item.device.price * item.count))}}
      td
        q-btn(icon="mdi-close" @click="removeDevice(item)" color="negative")
    tr
      td(colspan="2").text-right Итого:
      td.text-right {{$priceFormat($priceByCurrencyNet(items.reduce((a,b)=>a+b.device.price * b.count,0)))}}
</template>

<style scoped>

</style>