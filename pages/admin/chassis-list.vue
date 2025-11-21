<script setup lang="ts">
const list = ref()
async function load(){
  list.value = await useNuxtApp().$GET('/chassis/list')
}
onMounted(load)
</script>

<template lang="pug">
div.flex(v-if="list")
  ChassisCard(v-for="item in list" :chassis="item")
</template>

<style scoped lang="sass">
.item
  border: 1px solid silver
  margin: 2px 0

</style>