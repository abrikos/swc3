<script setup lang="ts">
import DeviceTable from "~/components/order/DeviceTable.vue";
import NetworkCategories from "~/components/order/NetworkCategories.vue";

const items = defineModel<{device:IDevice, count:number}[]>()

</script>

<template lang="pug">
  div.row
    div.col
      NetworkCategories
    div.col
      DeviceTable(v-model="items" )
</template>

<style scoped>

</style>