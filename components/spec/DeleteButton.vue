<script setup lang="ts">
import {storeToRefs} from "pinia";
import {useCustomStore} from "~/store/custom-store";

const {loggedUser} = storeToRefs(useCustomStore())
const {$event} = useNuxtApp()
const {spec} = defineProps({
  spec:{type:Object, required: true},
})


async function deleteSpec() {
  await useNuxtApp().$DELETE(`/spec/${spec.id}`)
  $event('specs:reload')
}

</script>

<template lang="pug">
  q-btn(v-if="spec.user.id === loggedUser.id" icon="mdi-delete" color="negative" @click.stop)
    q-tooltip Удалить "{{spec.name}}"
    q-popup-proxy(cover transition-show="scale" transition-hide="scale")
      q-banner Удалить конфигурацию "{{spec.name}}"? &nbsp;
        q-btn( @click.stop="deleteSpec(spec.id)" label="OK" v-close-popup color="negative" )
        q-btn( @click.stop label="Отмена" v-close-popup)


</template>

<style scoped>

</style>