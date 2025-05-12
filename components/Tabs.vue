<script setup lang="ts">
const props = defineProps({
  items: {type: Object, required: true},
})
</script>

<template lang="pug">
  q-tabs
    q-route-tab(v-for="item of items" :name="item.name" :icon="item.icon" :label="item.label" :to="{query:{tab:item.name}}")
</template>

<style scoped>

</style>