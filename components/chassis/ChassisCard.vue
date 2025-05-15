<script setup lang="ts">
import {storeToRefs} from "pinia";
import {useCustomStore} from "~/store/custom-store";

const props = defineProps({
  chassis: {type: Object, required: true}
})
const {loggedUser} = storeToRefs(useCustomStore())

const rnd = ref()
const {$listen} = useNuxtApp()
$listen('chassis:reload-images', () => {
  rnd.value = Math.random()
})

async function createConfiguration(chassis: any) {
  const conf = await useNuxtApp().$GET('/conf/create/chassis/' + chassis.id) as IConf
  if (conf) {
    navigateTo('/servers/conf/' + conf.id)
  }
}
</script>

<template lang="pug">
  div.chassis
    div(@click="createConfiguration(chassis)" :title="chassis.descFull")
      div.image
        img(:src="`/chassis/${chassis.partNumber}.jpg?${rnd}`" onerror="this.src='/logo.png'")
      strong {{chassis.partNumber}}
      small {{chassis.params}}
    div(v-if="loggedUser.isAdmin") Admin:
      ChassisUpload(:chassis="chassis")
      ChassisHide(:chassis="chassis")

</template>

<style scoped lang="sass">
.chassis
  cursor: pointer
  border: 1px solid silver
  margin: 5px
  width: 200px
  padding: 5px
  text-align: center

  .image
    height: 130px

    img
      max-width: 100%

  strong, small
    display: block

</style>