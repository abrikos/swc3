<script setup lang="ts">
const props = defineProps({
  chassis: {type: Object, required: true},
})
const {$event} = useNuxtApp()
const input = ref()

async function uploadImage(e: any) {
  const formData = new FormData()
  formData.append('file', e.target.files[0])
  await useNuxtApp().$POST('/chassis/upload/'+props.chassis.id, formData)
  input.value.value = null
  $event('chassis:reload-images')
}
</script>

<template lang="pug">
  input( type="file" accept="image/*" @change="uploadImage" ref="input" hidden)
  q-btn(@click="()=>input.click()" icon="upload" color="secondary" round )
    q-tooltip Загрузить изображение
</template>

<style scoped>

</style>