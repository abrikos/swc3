<script setup lang="ts">
const model = defineModel()
const {update} = defineProps({update: Function})
</script>

<template lang="pug">
  q-btn(icon="mdi-pencil" round)
    q-popup-edit(v-model="model" auto-save v-slot="scope")
      q-input(v-model="model" autofocus @keyup.enter.prevent="scope.set();update()" hint="Enter для сохранения")

</template>

<style scoped>

</style>