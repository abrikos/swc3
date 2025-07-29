<script setup lang="ts">
import OrderBasket from "~/components/order/OrderBasket.vue";
import NetworkCategories from "~/components/order/NetworkCategories.vue";
import DeviceTable from "~/components/order/DeviceTable.vue";
import CategoryTree from "~/components/order/CategoryTree.vue";
import {useCustomStore} from "~/store/custom-store";
const {loggedUser} = useCustomStore()
const items = ref<{device:IDevice, count:number}[]>([])
</script>

<template lang="pug">
  div.row(v-if="loggedUser.isNetwork")
    div.col-sm-4
      //DeviceChoose(v-model="items")
      NetworkCategories(v-model="items" )
      //CategoryTree
    //div.col-sm
      DeviceTable(v-model="items" )

    div.col-sm.q-px-sm
      OrderBasket(v-model="items")

</template>

<style scoped>

</style>