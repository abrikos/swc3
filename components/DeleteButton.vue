<script setup lang="ts">
const {$event} = useNuxtApp()
const {name, path, event, id} = defineProps({
  name:{type:String},
  path:{type:String, required: true},
  event:{type:String, required: true},
  id:{type:String, required: true},
})


async function deleteSpec() {
  await useNuxtApp().$DELETE(`${path}/${id}`)
  $event(event)
}

</script>

<template lang="pug">
  q-btn(icon="mdi-delete" color="negative" @click.stop round)
    q-tooltip Удалить "{{name}}"
    q-popup-proxy(cover transition-show="scale" transition-hide="scale")
      q-banner Удалить "{{name}}"? &nbsp;
        q-btn( @click.stop="deleteSpec" label="OK" v-close-popup color="negative" )
        q-btn( @click.stop label="Отмена" v-close-popup)


</template>

<style scoped>

</style>