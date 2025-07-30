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
import type {IOrderSubItem} from "~/server/models/order-subitem";

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
  $event('power:check')
}
onMounted(load)

async function updateItem(item:IOrderItem){
  await useNuxtApp().$POST('/order/item/update', item)
  await load()
  showCategories.value = false
}
async function updateSubItem(item:IOrderSubItem){
  await useNuxtApp().$POST('/order/sub/update', item)
  await load()
  showCategories.value = false
}

const itemsSorted = computed(()=>order.value.items
    .sort((a:IOrderItem, b:IOrderItem) => (a.sort < b.sort) ? 1 : ((b.sort < a.sort) ? -1 : 0)))
let i2 = 1

async function save(){
  await useNuxtApp().$POST('/order/update/'+route.params.id, order.value)
  showCategories.value = false
}

async function sort(item: IOrderItem, inc:number){
  await useNuxtApp().$POST('/order/item/sort/'+item.id, {inc})
  await load()
}

</script>

<template lang="pug">
div(v-if="order")
  q-toolbar
    q-toolbar-title.cursor-pointer {{order.name}}
      EditField(v-model="order.name" :update="save")
    q-space
    strong Сумма: {{$priceFormat($priceByCurrencyNet(order.total))}}
  div.row
    div.col-sm-4(v-if="showCategories")
      NetworkCategories(v-model="order.items" )
      q-btn(label="Закрыть" @click="showCategories=false")
    div.col-sm.q-pa-sm
      //q-input(v-model="order.name" @focus="(input) => input.target.select()" label="Название конфигурации")
      q-card.q-mb-sm(v-for="(item, i1) of itemsSorted" :key="item.id")
        q-card-section
          div.row
            div.col-1.flex
              div.column.self-end
                q-btn(icon="mdi-arrow-up" @click="sort(item,1)" size="sm" title="Двинуть вверх")
                q-btn(icon="mdi-arrow-down" @click="sort(item,-1)" size="sm"  title="Двинуть вниз")
              div.self-start {{i1+1}}
            div.col
              div.row
                div.col
                  div {{item.device.name}}
                    br
                    small {{item.device.description}}
                div.col-2
                  q-input(v-model.number="item.count" @update:model-value="updateItem(item)" type="number" min="0")
                    template(v-slot:append)
                      q-btn(@click="item.count = 0; updateItem(item)" icon="mdi-close" color="negative")
                div.col-2.text-right(style="width:100px") {{$priceFormat($priceByCurrencyNet(item.device.price * item.count))}}
              div.bg-grey-4.q-pa-sm
                div.row(v-for="(sub, i2) in item.subItems")
                  div.col-1 {{i1+1}}.{{i2+1}}
                  div.col {{sub.device?.name || sub.service.name}}
                      br
                      small {{sub.device?.description || sub.service.description}}
                  div.col-2
                    q-input(v-model.number="sub.count" @update:model-value="updateSubItem(sub)" type="number" min="0")
                      template(v-slot:append)
                        q-btn(@click="sub.count = 0;updateSubItem(sub)" icon="mdi-close" color="negative")
                  div.col-2.text-right(style="width:100px") {{$priceFormat($priceByCurrencyNet((sub.device?.price || sub.service.price) * sub.count) )}}

      q-btn(v-if="!showCategories" @click="showCategories=true" label="Добавить устройства")


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
.subitems
  background-color: silver
td
  max-width: 200px
</style>