<script setup lang="ts">
import {storeToRefs} from "pinia";
import {useCustomStore} from "~/store/custom-store";
const {$event} = useNuxtApp();
const {conf} = defineProps({
  conf:{type:Object, required:true},
})
const {$priceByCurrencyServer, $priceFormat} = useNuxtApp()
const {loggedUser} = storeToRefs(useCustomStore())

async function deletePart(part:IPart){
  await useNuxtApp().$DELETE(`/conf/part/${part.id}`)
  $event('conf:reload')
}

</script>

<template lang="pug">

q-card
  q-card-section
    div.row
      div.col Корзина
      div.col {{ $priceFormat($priceByCurrencyServer(conf.priceTotal))}}
  q-card-section
    table
      tbody
        tr
          th Категория
          th Артикул
          th Количество
          th(v-if="loggedUser.isAdmin") Цена
          th(v-if="loggedUser.isAdmin") Сумма
        tr
          td(colspan="2") Платформа {{conf.chassis.partNumber}}
          td 1
          td.text-right(v-if="loggedUser.isAdmin") {{$priceFormat($priceByCurrencyServer(conf.chassis.price))}}
          td.text-right(v-if="loggedUser.isAdmin") {{$priceFormat($priceByCurrencyServer(conf.chassis.price))}}

        tr(v-for="part of conf.partsSorted" )
          td
            q-btn(size="sm" icon="mdi-close" color="red" @click="deletePart(part)")
            span {{part.component.category}} {{part.component.type}}
          td {{part.component.partNumber}}
          td.text-center {{part.count}}
          td.text-right(v-if="loggedUser.isAdmin") {{$priceFormat($priceByCurrencyServer(part.component.price))}}
          td.text-right(v-if="loggedUser.isAdmin") {{$priceFormat($priceByCurrencyServer(part.price))}}
        tr(v-if="conf.brokenStorageService")
          td(colspan="4") Невозврат неисправных накопителей
          td.text-right(v-if="loggedUser.isAdmin") {{$priceFormat($priceByCurrencyServer(conf.storagePrice))}}
        tr(v-if="conf.service")
          td(colspan="4") {{ conf.service.name }}
          td.text-right(v-if="loggedUser.isAdmin") {{$priceFormat($priceByCurrencyServer(conf.priceService))}}


</template>

<style scoped lang="sass">
table
  width: 100%
  font-size: .8em
  border-collapse: collapse
  tr
    border-bottom: 1px solid silver
    td
      padding: 5px
</style>