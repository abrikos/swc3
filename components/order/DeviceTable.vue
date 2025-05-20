<script setup lang="ts">
const items = defineModel<{device:IDevice, count:number}[]>()
const route = useRoute()
const devices = ref<IDevice[]>([])

async function load(){
  if(!route.query.sub) return
  devices.value = await useNuxtApp().$GET('/order/devices/'+route.query.sub) as IDevice[]
}
watch(()=>route.query.sub, (newVal, oldVal) => {
  load()
})
onMounted(load)

function addDevice(device:IDevice){
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
      td(:style="`color: ${device.torp?'red':''}`") {{ device.name }} {{device.torp && '(ТОРП)'}}
        div
          small {{ device.description }}
      td.text-right {{$priceFormat($priceByCurrencyNet(device.price))}}
      td.text-center
        q-btn(icon="mdi-plus-circle-outline" @click="addDevice(device)")
</template>

<style scoped>

</style>