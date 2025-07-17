<script setup lang="ts">
import ExcelButton from "~/components/ExcelButton.vue";
import CloneButton from "~/components/spec/CloneButton.vue";
import DeleteButton from "~/components/DeleteButton.vue";
import {storeToRefs} from "pinia";
import {useCustomStore} from "~/store/custom-store";
import ShareButton from "~/components/spec/ShareButton.vue";
import EditButton from "~/components/EditButton.vue";
import EditField from "~/components/EditField.vue";

const {loggedUser} = storeToRefs(useCustomStore())
const route = useRoute()
const error404 = ref()
const spec = ref()
async function load() {
  spec.value = await useNuxtApp().$GET(`/spec/${route.params.id}`)
  if (!spec.value) {
    navigateTo('/servers/spec/list')
  }
}

async function save() {
  await useNuxtApp().$POST(`/spec/${route.params.id}`, spec.value)
}
onMounted(load)
const {$listen} = useNuxtApp()
$listen('spec:reload', load)

const servPrice = computed(()=>spec.value.configurations.reduce((a:number, b:IConf) => a + b.price * b.count, 0))
const netPrice = computed(()=>spec.value.orders.reduce((a:number, b:IOrder) => a + b.sum * b.count, 0))

async function saveConf(conf:IConf){
  await useNuxtApp().$POST(`/conf/update/${conf.id}`, conf)
}
async function saveOrder(order:IOrder){
  await useNuxtApp().$POST(`/order/update/${order.id}`, order)
}
</script>

<template lang="pug">
div(v-if="spec")
  q-toolbar
    q-toolbar-title.cursor-pointer {{spec.name}}
      EditField(v-model="spec.name" :update="save")
  q-toolbar
    div Сумма:&nbsp;
      strong {{$priceFormat($priceByCurrencyServer(servPrice) + $priceByCurrencyNet(netPrice))}}
    q-space
    ExcelButton(:id="spec.id" path="/spec" )
    ExcelButton(:id="spec.id" path="/spec" :confidential="true")
    q-btn(icon="mdi-server-outline" color="orange" :to="{path:'/servers/chassis', query:{spec:spec.id}}")
      q-tooltip Добавить серверную конфигурацию
    q-btn(icon="mdi-network-outline" color="green" :to="{path:'/network/choose', query:{spec:spec.id}}")
      q-tooltip Добавить сетевую конфигурацию
    CloneButton(:spec="spec.id")
    ShareButton(:spec="spec.id")
    DeleteButton(v-if="spec.user.id === loggedUser.id"  :id="spec.id" :name="spec.name" path="/spec" event="spec:reload" )

  div.flex.justify-between.items-center
    div
  table.fit
    tbody
      tr
        th
        th(width="400") Описание
        th(width="100") Кол-во
        th.text-right Цена
        th.text-right Сумма
        th.text-right

    tbody(v-if="spec.configurations.length")
      tr.bg-orange-1
        td.text-left(colspan="4")
          q-icon(name="mdi-server-outline")
          span Серверные
        td.text-right.text-weight-bold {{$priceFormat($priceByCurrencyServer(servPrice))}}
        td
      tr(v-for="conf of spec.configurations" :key="conf.id")
        td
          router-link(:to="`/servers/conf/${conf.id}?category=CPU`") {{conf.name}}
        td {{ conf.description }}
        td
          q-input(v-model="conf.count" type="number" min="1" @update:model-value="saveConf(conf)")
        td.text-right {{$priceFormat($priceByCurrencyServer(conf.price))}}
        td.text-right {{$priceFormat($priceByCurrencyServer(conf.price * conf.count))}}
        td
          DeleteButton(v-if="conf.user === loggedUser.id"  :id="conf.id" :name="conf.name" path="/conf/delete" event="spec:reload" )
      //tr.bg-orange-1
        td.text-right(colspan="4") Итого:
        td.text-right.text-weight-bold {{$priceFormat($priceByCurrencyServer(servPrice))}}
        td

    tbody(v-if="spec.orders.length")
      tr
        td &nbsp;
    tbody(v-if="spec.orders.length")
      tr.bg-green-1
        td.text-left(colspan="4")
          q-icon(name="mdi-network-outline")
          span Сетевые
        td.text-right.text-weight-bold {{$priceFormat($priceByCurrencyNet(netPrice))}}
        td
      tr(v-for="order of spec.orders" :key="order.id")
        td
          router-link(:to="`/network/order/${order.id}`") {{order.name || order.id}}
        td {{ order.description }}
        td
          q-input(v-model="order.count" type="number" min="1" @update:model-value="saveOrder(order)")
        td.text-right {{$priceFormat($priceByCurrencyNet(order.sum))}}
        td.text-right {{$priceFormat($priceByCurrencyNet(order.sum * order.count))}}
        td
          DeleteButton(v-if="order.user === loggedUser.id"  :id="order.id" :name="order.name" path="/order/delete" event="spec:reload" )
      //tr.bg-green-1
        td.text-right(colspan="4") Итого:
        td.text-right.text-weight-bold {{$priceFormat($priceByCurrencyNet(netPrice))}}
        td
</template>

<style scoped lang="sass">
table
  border-collapse: collapse
  tr
    border-bottom: 1px solid silver

</style>