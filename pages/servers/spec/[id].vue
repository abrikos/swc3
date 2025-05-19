<script setup lang="ts">
import ExcelButton from "~/components/spec/ExcelButton.vue";
import CloneButton from "~/components/spec/CloneButton.vue";
import DeleteButton from "~/components/spec/DeleteButton.vue";

const route = useRoute()
const error404 = ref()
const spec = ref()
async function load() {
  spec.value = await useNuxtApp().$GET(`/spec/${route.params.id}`)
  if (!spec.value) {
    navigateTo('/server/spec/list')
  }
}
onMounted(load)
const {$listen} = useNuxtApp()
$listen('specs:reload', load)

</script>

<template lang="pug">
div(v-if="spec")
  div.flex.justify-between
    div
      strong.h1 {{spec.name}}
    div
      strong Всего: {{$priceFormat($priceByCurrencyServer(spec.priceServer) + $priceByCurrencyNet(spec.priceNet))}}
    div
      ExcelButton(:spec="spec.id")
      ExcelButton(:spec="spec.id" :confidential="true")
      CloneButton(:spec="spec.id")
      DeleteButton(:spec="spec")

  table.fit
    tbody(v-if="spec.configurations.length")
      tr
        th(colspan="4") Серверы
      tr
        th
        th(width="100") Кол-во
        th Цена
        th Сумма
      tr(v-for="conf of spec.configurations" :key="conf.id")
        td
          router-link(:to="`/servers/conf/${conf.id}?category=CPU`") {{conf.name}}
        td
          q-input(v-model="conf.count" type="number" min="1")
        td.text-right {{$priceFormat($priceByCurrencyServer(conf.price))}}
        td.text-right {{$priceFormat($priceByCurrencyServer(conf.priceTotal))}}
      tr
        td.text-right(colspan="3") Итого:
        td.text-right {{$priceFormat($priceByCurrencyServer(spec.priceServer))}}
    tbody(v-if="spec.orders.length")
      tr
        th Сетевое
      tr(v-for="order of spec.orders" :key="order.id")
        td {{order.name || order.id}}
        td
          q-input(v-model="order.count" type="number" min="1")
        td.text-right {{$priceFormat($priceByCurrencyNet(order.sum))}}
        td.text-right {{$priceFormat($priceByCurrencyNet(order.total))}}

      tr
        td.text-right(colspan="3") Итого:
        td.text-right {{$priceFormat($priceByCurrencyNet(spec.priceNet))}}

</template>

<style scoped lang="sass">
table
  border-collapse: collapse
  tr
    border-bottom: 1px solid silver

</style>