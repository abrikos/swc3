<script setup lang="ts">
const {color} = defineProps({
  color:{type:String}
})
const cls = computed(()=>{
  switch (color) {
    case 'error':
      return 'bg-red'
    case 'warning':
      return 'bg-orange'
    case 'success':
      return 'bg-green'
    default:
      return 'bg-grey'
  }
})
</script>

<template lang="pug">
  q-banner.text-white.fixed-center(:class="cls" rounded)
    slot
</template>

<style scoped>

</style>