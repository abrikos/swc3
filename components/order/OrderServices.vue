<script setup lang="ts">
const {$listen, $event} = useNuxtApp()
const order = defineModel()

const itemsForAdding = computed(() => {
  return order.value.items.filter((i: IOrderItem) => i.device?.services?.length)
      .filter((i:IOrderItem)=>{
        return !i.subItems.map(s=>s.service?.name).filter(n=>i.device.services.map(s=>s.name).includes(n)).length
      })
})


const showDialog = ref(false)
const itemSelected = ref<IOrderItem>()

async function showServicesDialog(item: IOrderItem) {
  itemSelected.value = item
  showDialog.value = true
}

async function addService(service: INetService) {
  const add = {
    service,
    count: 1,
    item: itemSelected.value,
  }
  await useNuxtApp().$POST(`/order/item/add/sub`, add)
  $event('order:reload')
  showDialog.value = false
}

</script>

<template lang="pug">
  Banner(color="warning" v-for="warn of itemsForAdding" )
    div.flex.justify-between
      div Для "{{ warn.device.name }}" рекомендуем тех.поддержку
      q-btn(label="Добавить сервис" @click="showServicesDialog(warn)")

  Dialog(v-model="showDialog" title="Выбрать сервис")
    table
      tbody
        tr
          th Артикул
          th(width="50%") Описание
          th Цена
          th
        tr(v-for="service in itemSelected?.device.services" :key="service.id" )
          td {{ service.name }}
          td {{ service.description }}
          td.text-right {{$priceFormat($priceByCurrencyNet(service.price))}}
          td
            q-btn(icon="mdi-plus-circle-outline" @click="addService(service)")
</template>

<style scoped>

</style>