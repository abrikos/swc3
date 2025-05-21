<script setup lang="ts">
const items = defineModel<{device:IDevice, count:number}[]>()
const devices = ref<IDevice[]>([])
const {$event, $listen} =useNuxtApp()
const category = ref()
$listen('order:category', (id:string)=>{
  category.value = id
  load()
})
async function load(){
  if(!category.value) return
  devices.value = await useNuxtApp().$GET('/order/devices/'+category.value) as IDevice[]
}
onMounted(load)

function addDevice(device:IDevice){
  $event('order:addDevice',device)
  const exists = items.value?.find((i:any)=>i.device.id === device.id)
  if(exists){
    exists.count++
  }else {
    items.value?.push({device, count: 1})
  }
}

</script>

<template lang="pug">
table
  tbody
    tr
      th Описание
      th Название
      th
    tr(v-for="device of devices")
      td(:style="`color: ${device.torp?'red':''}`") {{ device.name }} {{device.torp ? '(ТОРП)':''}}
        div
          small {{ device.description }}
      td.text-right {{$priceFormat($priceByCurrencyNet(device.price))}}
      td.text-center
        q-btn(icon="mdi-plus-circle-outline" @click="addDevice(device)")
</template>

<style scoped>

</style>