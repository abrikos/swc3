<script setup lang="ts">
const dialog = defineModel()
const {title} = defineProps({
  title: String,
})
</script>

<template lang="pug">
  q-dialog(v-model="dialog" position="bottom" )
    q-card(style="width: 1200px; max-width: 80vw;")
      q-card-section.flex.justify-between
        q-toolbar
          q-toolbar-title.text-weight-bold {{title}}
          q-btn(icon="mdi-close" @click="dialog = false" )
            q-tooltip Закрыть
      q-card-section
        slot


</template>

<style scoped>

</style>