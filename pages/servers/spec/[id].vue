<script setup lang="ts">
import ExcelButton from "~/components/ExcelButton.vue";
import CloneButton from "~/components/spec/CloneButton.vue";
import DeleteButton from "~/components/DeleteButton.vue";
import {storeToRefs} from "pinia";
import {useCustomStore} from "~/store/custom-store";
import ShareButton from "~/components/spec/ShareButton.vue";

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
$listen('specs:reload', load)

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
    q-toolbar-title {{spec.name}}
      q-btn(icon="mdi-pencil" round)
        q-popup-proxy.q-pa-sm
          q-input(v-model="spec.name" @focus="(input) => input.target.select()" label="Название спецификации" style="width:300px")
          q-btn(label="Сохранить" @click="save" v-close-popup)

    div Сумма:&nbsp;
      strong {{$priceFormat($priceByCurrencyServer(servPrice) + $priceByCurrencyNet(netPrice))}}
    q-space
    ExcelButton(:id="spec.id" path="/spec" )
    ExcelButton(:id="spec.id" path="/spec" :confidential="true")
    CloneButton(:spec="spec.id")
    ShareButton(:spec="spec.id")
    q-btn(icon="mdi-server-outline" color="green" :to="{path:'/servers/chassis', query:{spec:spec.id}}")
      q-tooltip Добавить серверную конфигурацию
    q-btn(icon="mdi-network-outline" color="green" :to="{path:'/network/choose', query:{spec:spec.id}}")
      q-tooltip Добавить сетевую конфигурацию

    DeleteButton(v-if="spec.user.id === loggedUser.id"  :id="spec.id" :name="spec.name" path="/spec" event="spec:reload" )

  div.flex.justify-between.items-center
    div
  table.fit
    tbody
      tr
        th
        th(width="100") Кол-во
        th.text-right Цена
        th.text-right Сумма

    tbody.bg-orange(v-if="spec.configurations.length")
      tr
        td.text-left(colspan="4")
          q-icon(name="mdi-server-outline")
          span Серверные
      tr(v-for="conf of spec.configurations" :key="conf.id")
        td
          router-link(:to="`/servers/conf/${conf.id}?category=CPU`") {{conf.name}}
        td
          q-input(v-model="conf.count" type="number" min="1" @update:model-value="saveConf(conf)")
        td.text-right {{$priceFormat($priceByCurrencyServer(conf.price))}}
        td.text-right {{$priceFormat($priceByCurrencyServer(conf.price * conf.count))}}
      tr
        td.text-right(colspan="3") Итого:
        td.text-right.text-weight-bold {{$priceFormat($priceByCurrencyServer(servPrice))}}
    tbody
      tr
        td &nbsp;
    tbody(v-if="spec.orders.length").bg-green
      tr
        td.text-left(colspan="4")
          q-icon(name="mdi-network-outline")
          span Сетевые
      tr(v-for="order of spec.orders" :key="order.id")
        td
          router-link(:to="`/network/order/${order.id}`") {{order.name || order.id}}
        td
          q-input(v-model="order.count" type="number" min="1" @update:model-value="saveOrder(order)")
        td.text-right {{$priceFormat($priceByCurrencyNet(order.sum))}}
        td.text-right {{$priceFormat($priceByCurrencyNet(order.sum * order.count))}}

      tr
        td.text-right(colspan="3") Итого:
        td.text-right.text-weight-bold {{$priceFormat($priceByCurrencyNet(netPrice))}}
</template>

<style scoped lang="sass">
table
  border-collapse: collapse
  tr
    border-bottom: 1px solid silver

</style>