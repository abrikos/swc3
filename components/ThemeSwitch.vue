<script setup lang="ts">
import { useCookie } from '#app';
const themeWidth = useCookie<string>('themeWidth');
const drawerSide = useCookie<string>('drawerSide');
onMounted(()=>{
  if (!themeWidth.value) {themeWidth.value=''}
  if (!drawerSide.value) {drawerSide.value=''}
})
</script>

<template lang="pug">
  q-item
    q-toggle(v-model="themeWidth" label="Узкий размер" false-value="" true-value="right" )
  q-item
    q-toggle(v-model="drawerSide" label="Меню справа" false-value="" true-value="right" )
</template>

<style scoped>

</style>