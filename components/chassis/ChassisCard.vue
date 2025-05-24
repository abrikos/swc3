<script setup lang="ts">
import {storeToRefs} from "pinia";
import {useCustomStore} from "~/store/custom-store";
const route = useRoute()
const props = defineProps({
  chassis: {type: Object, required: true}
})
const {loggedUser} = storeToRefs(useCustomStore())

const rnd = ref(Math.random())
const {$listen} = useNuxtApp()
$listen('chassis:reload-images', () => {
  rnd.value = Math.random()
})

async function createConfiguration(chassis: any) {
  const conf = await useNuxtApp().$GET(`/conf/create/chassis/${chassis.id}?spec=${route.query.spec||''}`) as IConf
  if (conf) {
    navigateTo({path:'/servers/conf/' +conf.id, query:{category:'CPU'}})
  }
}
</script>

<template lang="pug">
  div.chassis
    div(@click="createConfiguration(chassis)" :title="chassis.descFull")
      div.image
        img(:src="`/api/chassis/image/${chassis.partNumber}.jpg?rnd=${rnd}`" onerror="this.src='/icons/server-icon.png'")
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
      max-height: 110px

  strong, small
    display: block

</style>