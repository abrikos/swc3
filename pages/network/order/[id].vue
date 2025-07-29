<script setup lang="ts">
import {storeToRefs} from "pinia";
import {useCustomStore} from "~/store/custom-store";
import Dialog from "~/components/Dialog.vue";
import OrderTranscievers from "~/components/order/OrderTranscievers.vue";
import OrderPowers from "~/components/order/OrderPowers.vue";
import OrderWifi from "~/components/order/OrderWifi.vue";
import NetworkCategories from "~/components/order/NetworkCategories.vue";
import DeviceTable from "~/components/order/DeviceTable.vue";
import EditButton from "~/components/EditButton.vue";
import EditField from "~/components/EditField.vue";

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
  showCategories.value = false
}

const itemsSorted = computed(()=>order.value.items
    .sort((a:IOrderItem, b:IOrderItem) => (a.sortName < b.sortName) ? 1 : ((b.sortName < a.sortName) ? -1 : 0)))

</script>

<template lang="pug">
div(v-if="order")
  q-toolbar
    q-toolbar-title.cursor-pointer {{order.name}}
      EditField(v-model="order.name" :update="save")
  div.row
    div.col-sm-4(v-if="showCategories")
      NetworkCategories(v-model="order.items" )
    div.col-sm.q-pa-sm
      //q-input(v-model="order.name" @focus="(input) => input.target.select()" label="Название конфигурации")
      q-card
        q-card-section
          table
            tbody
              tr
                th Наименование
                th Количество
                th Сумма, {{ loggedUser?.currency }}
              tr(v-for="item of itemsSorted" :key="item.id" :class="item.notDevice ? 'bg-grey-4': ''")
                td
                  div(:class="item.notDevice?'q-pl-lg':''") {{item.device?.name||item.service.name}}
                    br
                    small {{item.device?.description||item.service.description}}
                td(style="width:100px")
                  q-input(v-model.number="item.count" @update:model-value="filterZero" type="number" min="0")
                    template(v-slot:append)
                      q-btn(@click="item.count = 0; filterZero()" icon="mdi-close" color="negative")
                td.text-right(style="width:100px") {{$priceFormat($priceByCurrencyNet(item.device?.price || item.service?.price||0) * item.count)}}

              tr
                td.text-right(colspan="2") Итого:
                td.text-right {{$priceFormat($priceByCurrencyNet(order.items.reduce((sum, item)=>sum + ((item.device?.price||item.service.price) * item.count)||0, 0)))}}

          q-card-actions.flex.justify-between
            q-btn(@click="save" label="Сохранить" color="primary")
            q-btn(v-if="!showCategories" @click="showCategories=true" label="Добавить устройства")
            q-btn(@click="showCategories=false; load()" label="Сбросить")

    div.col-sm.q-pa-sm(v-if="!showCategories")
      AddToSpec(type="order")
      OrderServices(v-model="order")
      OrderTranscievers(v-model="order")
      OrderPowers(v-model="order")
      OrderWifi(v-model="order")
  //Dialog(v-model="showCategories" title="Добавление устройства" )
    div.row
      div.col-sm-4
        NetworkCategories
      div.col-sm
        DeviceTable(v-model="order.items" )

</template>

<style scoped lang="sass">
td
  max-width: 200px
</style>