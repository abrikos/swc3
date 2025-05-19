<script setup lang="ts">
const {$event} = useNuxtApp()
const {spec} = defineProps({
  spec:{type:String, required: true},
})
async function cloneSpec() {
  const newSpec = await useNuxtApp().$GET(`/spec/clone/${spec}`)
  $event('specs:reload')
}

</script>

<template lang="pug">
  q-btn(icon="mdi-content-duplicate" @click.stop="cloneSpec")
    q-tooltip Клонировать

</template>

<style scoped>

</style>