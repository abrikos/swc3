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
$listen('order:addDevice', (device: IDevice) => {
  const exists = order.value.items?.find((i: IOrderItem) => i.device.id === device.id)

  if (exists) {
    exists.count++
  } else {
    order.value.items.push({device, count: 1})
  }


})

const {loggedUser} = storeToRefs(useCustomStore())
const route = useRoute()
const order = ref()
const showCategories = ref(false)

async function load() {
  order.value = await useNuxtApp().$GET('/order/' + route.params.id)
  console.log('fffff', order.value.items.length)
  $event('power:check')
}

onMounted(load)

async function updateItem(item: IOrderItem) {
  await useNuxtApp().$POST('/order/item/update', item)
  await load()
  //showCategories.value = false
}

async function updateSubItem(item: IOrderSubItem) {
  await useNuxtApp().$POST('/order/sub/update', item)
  await load()
  //showCategories.value = false
}

const itemsSorted = computed(() => order.value.items
    .sort((a: IOrderItem, b: IOrderItem) => (a.sort < b.sort) ? 1 : ((b.sort < a.sort) ? -1 : 0)))
let i2 = 1

async function save() {
  await useNuxtApp().$POST('/order/update/' + route.params.id, order.value)
  showCategories.value = false
}

async function sort(item: IOrderItem, inc: number) {
  await useNuxtApp().$POST('/order/item/sort/' + item.id, {inc})
  await load()
}

async function sortTo(targetItem: IOrderItem, item: IOrderItem, inc: number) {
  await useNuxtApp().$POST('/order/item/sort', {targetItem, item, inc})
  await load()
}
</script>

<template lang="pug">
  div(v-if="order")
    q-toolbar
      q-toolbar-title.cursor-pointer {{order.name}}
        EditField(v-model="order.name" :update="save")
      q-space
    div.row
      div.col-sm-4(v-if="showCategories")
        q-card
          q-toolbar
            q-toolbar-title Добавление устройств
            q-btn(icon="mdi-close" @click="showCategories=false")
          q-card-section
            NetworkCategories(v-model="order.items" )
          q-card-actions
            q-btn(label="Закрыть" @click="showCategories=false")
      div.col-sm-8.q-px-sm
        //q-input(v-model="order.name" @focus="(input) => input.target.select()" label="Название конфигурации")
        q-card.q-mb-sm(v-for="(item, i1) of itemsSorted" :key="item.id" :class="i1 % 2 ? 'bg-grey-3':''" )
          q-card-section
            div.row
              div.col-sm
                div.row.items-center
                  div.col-1-sm.text-right.q-pr-sm.text-weight-bold {{i1+1}}
                  div.col-sm  {{item.device.name}}
                  div.col-2-sm
                    q-input(v-model.number="item.count" @update:model-value="updateItem(item)" type="number" min="0")
                      template(v-slot:append)
                        q-btn(@click="item.count = 0; updateItem(item)" icon="mdi-close" color="negative")
                  div.col-2-sm.text-right(style="width:100px") {{$priceFormat($priceByCurrencyNet(item.device.price * item.count))}}
                small {{item.device.description}}
                div.q-pa-sm.subitems(v-if="item.subItems.length")
                  div(v-for="(sub, i2) in item.subItems")
                    div.row.items-center
                      div.col-2-sm.text-right.q-pr-sm.text-weight-bold {{i1+1}}.{{i2+1}}
                      div.col-sm {{sub.device?.name || sub.service.name}}
                      div.col-2-sm
                        q-input(v-model.number="sub.count" @update:model-value="updateSubItem(sub)" type="number" min="0")
                          template(v-slot:append)
                            q-btn(@click="sub.count = 0;updateSubItem(sub)" icon="mdi-close" color="negative")
                      div.col-2.text-right(style="width:100px") {{$priceFormat($priceByCurrencyNet((sub.device?.price || sub.service.price) * sub.count) )}}
                    small {{sub.device?.description || sub.service.description}}
              div.col-sm-1.text-center
                q-btn(icon="mdi-arrow-up-down" size="sm"  title="Выбрать позицию")
                  q-popup-proxy
                    q-card
                      q-toolbar
                        q-toolbar-title Выбрать позицию для "{{item.device.name}}"
                      q-card-section
                        div.row.items-center(v-for="targetItem in order.items")
                          div.col(:class="targetItem.id===item.id?'text-grey':''") {{targetItem.device.name}}
                          div.col(v-if="targetItem.id!==item.id")
                            q-btn( label="Над" @click="sortTo(targetItem, item, 0)" )
                            q-btn( label="Под" @click="sortTo(targetItem, item, 1)")
                q-btn(icon="mdi-file-document-arrow-right" size="sm"  title="Переместить в устройство")
                  q-popup-proxy
                    q-card
                      q-toolbar
                        q-toolbar-title "{{item.device.name}}" - в какое устройство переместить?
                      q-card-section
                        div(v-for="moveToItem in order.items.filter(i=>i.id!==item.id)")
                          q-btn( :label="moveToItem.device.name" @click="moveTo(moveToItem, item)")
                            q-tooltip {{moveToItem.device.description}}

        div.col.text-right.text-weight-bold Итого: {{$priceFormat($priceByCurrencyNet(order.total))}}

      div.col-sm.q-px-sm(v-if="!showCategories")
        AddToSpec(type="order")
        q-btn(v-if="!showCategories" @click="showCategories=true" label="Добавить устройства")
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
  border-left: 4px solid gray

td
  max-width: 200px
</style>