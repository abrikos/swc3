<script setup lang="ts">
import Dialog from "~/components/Dialog.vue";

const {order} = defineProps({
  order: {type: Object, required: true},
})

const wifiServers = ref([])
const wifiLicenses = ref([])
onMounted(async () => {
  wifiServers.value = await useNuxtApp().$GET('/order/wifi-servers') as never[]
  wifiLicenses.value = await useNuxtApp().$GET('/order/wifi-licenses') as never[]
})

const wiFiServersInList = computed(() => {
  return order.items
      .filter((i: IOrderItem) => wifiServers.value.map((w: IDevice) => w.id).includes(i.device?.id))
})
const wiFiItems = computed(() => {
  return order.items
      .filter((i: IOrderItem) => i.device?.subcategory?.name?.match('точки доступа'))
})
const wifiNoLicense = computed(() => {
  const licForDev = order.items.map((l: IOrderItem) => l.licenseForDevice)
  return wiFiItems.value
      .filter((i: IOrderItem) => !licForDev.includes(i.device?.id))
})

const dialogWiFiServer = ref()
const dialogLicense = ref()

function addWiFiServer(device: IDevice) {
  const add = {device, count: 1, notDevice: true}
  const exists = order.items.find((i: IOrderItem) => i.device?.id === device.id)
  if (exists) {
    exists.count = exists.count * 1 + err.needed * 1
  } else {
    order.items.push(add)
  }
  dialogWiFiServer.value = false
}

function addWiFiLicense(device: IDevice, license: IDevice) {
  const add = {device: license, count: 1, sortName: device.name, licenseForDevice: device.id, notDevice: true}
  const exists = order.items.find((i: IOrderItem) => i.device?.id === license.id)
  if (exists) {
    exists.count = exists.count * 1 + err.needed * 1
  } else {
    order.items.push(add)
  }
  dialogLicense.value = false
}

</script>

<template lang="pug">
  Banner(v-if="wiFiItems.length && !wiFiServersInList.length" color="warning" )
    div.flex.justify-between.items-center.no-wrap
      span Необходимо самостоятельно организовать контроллер на своих вычислительных ресурсах или
      q-btn(@click="dialogWiFiServer=true") Добавить контроллер

  Banner(color="info" v-for="(item,i) of wifiNoLicense" :key="i")
    div.flex.justify-between.items-center
      span Выбрать лицензию для {{item.device.name}}
      q-btn(@click="wifiDevice=item.device; dialogLicense=true") Добавить лицензию

  Dialog(v-model="dialogLicense" title="Выбрать лицензию")
    div(v-for="(license, i) in wifiLicenses")
      q-btn(@click="addWiFiLicense(wifiDevice,license)" :key="i" color="primary") {{license.name}}
      span - {{license.description}}

  Dialog(v-model="dialogWiFiServer" title="Выбрать контроллер")
    table
      tbody
        tr(v-for="(serv,i) of wifiServers" :key="i")
          td(width="200") {{serv.name}}
          td
            small {{serv.description}}
          td.text-right(width="100") {{$priceFormat($priceByCurrencyNet(serv.price))}}
          td
            q-btn(@click="addWiFiServer(serv)" icon="mdi-plus-circle-outline")

</template>

<style scoped>

</style>