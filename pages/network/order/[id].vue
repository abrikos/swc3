<script setup lang="ts">
const route = useRoute()
const order = ref()
async function load() {
  order.value = await useNuxtApp().$GET('/order/'+route.params.id)
}
onMounted(load)
</script>

<template lang="pug">
div(v-if="order") {{order}}
</template>

<style scoped>

</style>