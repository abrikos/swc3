<script setup lang="ts">
const props = defineProps({
  chassis: {type: Object, required: true},
})
const {$event} = useNuxtApp()

async function switchHide() {
  await useNuxtApp().$PUT('/chassis/hide/'+props.chassis.id)
  $event('chassis:reload')
}
</script>

<template lang="pug">
  q-btn(@click="switchHide" :icon="chassis.hidden ? 'layers':'layers_clear'" color="secondary" round )
    q-tooltip Скрыть/Показать
</template>

<style scoped>

</style>