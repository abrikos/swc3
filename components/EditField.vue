<script setup lang="ts">
const model = defineModel()
const {update} = defineProps({update: Function})
</script>

<template lang="pug">
    q-btn(icon="mdi-pencil" size="sm" )
    q-popup-edit.full-widthBAK(v-model="model" auto-save v-slot="scope")
      q-input(v-model="model" autofocus @keyup.enter.prevent="scope.set();update()" hint="Enter для сохранения")

</template>

<style scoped>

</style>