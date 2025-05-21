<script setup lang="ts">
import {storeToRefs} from "pinia";
import {useCustomStore} from "~/store/custom-store";
import OrderServices from "~/components/order/OrderServices.vue";
import DeviceChoose from "~/components/order/DeviceChoose.vue";
import Dialog from "~/components/Dialog.vue";
import OrderTranscievers from "~/components/order/OrderTranscievers.vue";
import OrderPowers from "~/components/order/OrderPowers.vue";
import OrderWifi from "~/components/order/OrderWifi.vue";
const {$listen, $event} = useNuxtApp()
$listen('order:reload', load)
$listen('order:addDevice', (device:IDevice)=>{
  const exists = order.value.items?.find((i:IOrderItem)=>i.device.id === device.id)
  if(exists){
    exists.count++
  }else {
    order.value.items.push({device, count:1})
  }


})

const {loggedUser} = storeToRefs(useCustomStore())
const route = useRoute()
const order = ref()
const showCategories = ref(false)
async function load() {
  order.value = await useNuxtApp().$GET('/order/'+route.params.id)
}
onMounted(load)
function filterZero(){
  order.value.items = order.value.items?.filter((i:any) => i.count!==0)
  $event('power:check')
}

async function save(){
  await useNuxtApp().$POST('/order/update/'+route.params.id, order.value)
}

const itemsSorted = computed(()=>order.value.items
    .sort((a:IOrderItem, b:IOrderItem) => (a.sortName < b.sortName) ? 1 : ((b.sortName < a.sortName) ? -1 : 0)))

</script>

<template lang="pug">
div(v-if="order")
  q-input(v-model="order.name" )
  div.row
    div.col-sm
      table
        tbody
          tr
            th Наименование
            th(width="40%") Описание
            th(width="10%") Количество
            th Сумма, {{ loggedUser?.currency }}
            th
          tr(v-for="item of itemsSorted" :key="item.id" :class="item.notDevice ? 'bg-grey-4': ''")
            td {{item.notDevice && '&nbsp;&nbsp;&nbsp;'}} {{item.device?.name||item.service.name}}
            td
              small {{item.device?.description||item.service.description}}
            td
              q-input(v-model.number="item.count" @update:model-value="filterZero" type="number" min="0")
            td.text-right {{$priceFormat($priceByCurrencyNet(item.device?.price || item.service?.price||0) * item.count)}}
            td
              q-btn(@click="item.count = 0; filterZero()" icon="mdi-close" color="negative")
          tr
            td.text-right(colspan="3") Итого:
            td.text-right {{$priceFormat($priceByCurrencyNet(order.items.reduce((sum, item)=>sum + item.device?.price||item.service.price||0, 0)))}}

      div.flex.justify-between
        q-btn(@click="save" label="Сохранить" color="primary")
        q-btn(@click="showCategories=true" label="Добавить устройства")
        q-btn(@click="load" label="Сбросить")

      Dialog(v-model="showCategories" title="Добавление устройства" )
        DeviceChoose
    div.col-sm
      //OrderServices(:order="order")
      OrderTranscievers(:order="order")
      OrderPowers(:order="order")
      OrderWifi(:order="order")
</template>

<style scoped>

</style>