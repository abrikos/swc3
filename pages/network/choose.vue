<script setup lang="ts">
import DeviceChoose from "~/components/order/DeviceChoose.vue";
import OrderBasket from "~/components/order/OrderBasket.vue";

const items = ref<{device:IDevice, count:number}[]>([])
</script>

<template lang="pug">
  div.row
    div.col-sm.q-px-sm
      DeviceChoose(v-model="items")
    div.col-4-sm.q-px-sm
      OrderBasket(v-model="items")

</template>

<style scoped>

</style>