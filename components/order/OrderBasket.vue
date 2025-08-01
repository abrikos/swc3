<script setup lang="ts">
const route = useRoute()
const items = defineModel<{device:IDevice, count:number}[]>()

const itemsNotZeroCount = computed(()=>items.value?.filter((i:any) => i.count))

function filterZero(item:any){
  items.value = items.value?.filter((i:any) => i.count!==0)
}

async function save(){
  const id =await useNuxtApp().$POST('/order/basket/save?spec='+(route.query.spec||''), items.value)
  console.log(id)
  navigateTo(`/network/order/${id}`)
}

</script>

<template lang="pug">
table
  tbody
    tr
      th Наименование
      th Количество
      th Сумма
      th
    tr(v-for="item of items" :key="item.id")
      td {{ item.device.name }}
        div
          small {{ item.device.description }}
      td(width="150")
        q-input(v-model.number="item.count" type="number" min="0" @update:model-value="filterZero(item)")
          template(v-slot:append)
            q-btn(icon="mdi-close" @click="item.count = 0;filterZero()" color="negative")
      td.text-right {{$priceFormat($priceByCurrencyNet(item.device.price * item.count))}}

    tr
      td(colspan="2").text-right Итого:
      td.text-right {{$priceFormat($priceByCurrencyNet(items.reduce((a,b)=>a+b.device.price * b.count,0)))}}
q-btn(color="primary" label="Создать конфигурацию" @click="save" v-if="items.length>0" :flat="false")
</template>

<style scoped lang="sass">
td
  max-width: 200px
</style>