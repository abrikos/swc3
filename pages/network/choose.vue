<script setup lang="ts">
import OrderBasket from "~/components/order/OrderBasket.vue";
import NetworkCategories from "~/components/order/NetworkCategories.vue";
import DeviceTable from "~/components/order/DeviceTable.vue";

const items = ref<{device:IDevice, count:number}[]>([])
</script>

<template lang="pug">
  div.row
    div.col-3-sm.q-px-sm
      //DeviceChoose(v-model="items")
      NetworkCategories
    div.col-sm
      DeviceTable(v-model="items" )

    div.col-sm.q-px-sm
      OrderBasket(v-model="items")

</template>

<style scoped>

</style>