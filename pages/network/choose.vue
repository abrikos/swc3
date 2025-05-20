<script setup lang="ts">
import NetworkCategories from "~/components/network/NetworkCategories.vue";
const route = useRoute()
const devices = ref<IDevice[]>([])
async function load(){
  devices.value = await useNuxtApp().$GET('/order/devices/'+route.query.sub) as IDevice[]
}
watch(()=>route.query.sub, (newVal, oldVal) => {
  load()
})
onMounted(load)
</script>

<template lang="pug">
div.row
  div.col
    NetworkCategories
  div.col {{devices}}
</template>

<style scoped>

</style>