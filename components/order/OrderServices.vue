<script setup lang="ts">
const order = defineModel()
const itemsWithoutServices = computed(() => {
  return order.value.items.filter((i: IOrderItem) => i.device?.services?.length)
      .filter((i:IOrderItem)=>{
        const services = order.value.items.filter((s:IOrderItem)=>s.service).map((i:IOrderItem)=>i.sortName)
        return !services.includes(i.device.name)
      })
})

const showDialog = ref(false)
const itemSelected = ref<IOrderItem>()
async function showServicesDialog(item:IOrderItem){
  itemSelected.value = item
  showDialog.value = true
}

async function addService(service:INetService){
  const add = {service, count: 1, sortName: itemSelected.value?.device.name, notDevice:true}
  order.value.items.push(add)
  showDialog.value=false
}

</script>

<template lang="pug">
  Banner(color="warning" v-for="item of itemsWithoutServices" )
    div.flex.justify-between
      div Для "{{ item.device.name }}" рекомендуем тех.поддержку
      q-btn(label="Добавить сервис" @click="showServicesDialog(item)")
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