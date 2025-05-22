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

async function update() {
  await useNuxtApp().$POST(`/spec/${route.params.id}`, spec.value)
}
onMounted(load)
const {$listen} = useNuxtApp()
$listen('specs:reload', load)

</script>

<template lang="pug">
div(v-if="spec")
  q-input(v-model="spec.name" @keyup.enter="update" @focus="(input) => input.target.select()")
    template(v-slot:append)
      q-icon(name="mdi-pencil" )
  div
    ExcelButton(:id="spec.id" path="/spec" )
    ExcelButton(:id="spec.id" path="/spec" :confidential="true")
    CloneButton(:spec="spec.id")
    ShareButton(:spec="spec.id")
    DeleteButton(v-if="spec.user.id === loggedUser.id"  :id="spec.id" :name="spec.name" path="/spec" event="spec:reload" )

  table.fit
    tbody(v-if="spec.configurations.length")
      tr.bg-grey
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
      tr.bg-grey-4
        td.text-right(colspan="3") Итого:
        td.text-right {{$priceFormat($priceByCurrencyServer(spec.priceServer))}}


    tbody(v-if="spec.orders.length")
      tr.bg-grey
        th(colspan="4") Сетевое
      tr(v-for="order of spec.orders" :key="order.id")
        td
          router-link(:to="`/network/order/${order.id}`") {{order.name || order.id}}
        td
          q-input(v-model="order.count" type="number" min="1")
        td.text-right {{$priceFormat($priceByCurrencyNet(order.sum))}}
        td.text-right {{$priceFormat($priceByCurrencyNet(order.total))}}

      tr.bg-grey-4
        td.text-right(colspan="3") Итого:
        td.text-right {{$priceFormat($priceByCurrencyNet(spec.priceNet))}}
    tbody
      tr.bg-grey
        td.text-right(colspan="3") Всего:
        td.text-right
          strong {{$priceFormat($priceByCurrencyServer(spec.priceServer) + $priceByCurrencyNet(spec.priceNet))}}
</template>

<style scoped lang="sass">
table
  border-collapse: collapse
  tr
    border-bottom: 1px solid silver

</style>