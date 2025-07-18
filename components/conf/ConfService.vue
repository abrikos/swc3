<script setup lang="ts">
const services = ref<IService[]>([])

async function load() {
  services.value = await useNuxtApp().$GET('/conf/services') as IService[];
}

onMounted(load)

const props = defineProps({
  conf: {type: Object, required: true},
})
const {$event} = useNuxtApp()
const service = ref(props.conf.service.id)
const brokenStorageService = ref(props.conf.brokenStorageService)

async function onServiceChange() {

  await useNuxtApp().$POST(`/conf/update/${props.conf.id}`, {service: service.value})
  $event('conf:reload')
}

async function switchBrokenStorageService() {
  await useNuxtApp().$GET(`/conf/broken-storage-switch/${props.conf.id}`)
  $event('conf:reload')
}

</script>

<template lang="pug">
  q-option-group(:options="services.map((s:IService)=>({label:s.name,value:s.id}))" type="radio" v-model="service" @update:model-value="onServiceChange")
  q-checkbox(v-model="brokenStorageService" :label="`Невозврат неисправных накопителей: ${conf.storagePrice}`" @update:model-value="switchBrokenStorageService")
</template>

<style scoped>

</style>