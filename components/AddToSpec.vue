<script setup lang="ts">
const {type} = defineProps({
  type: {type: String, required: true},
})
const route = useRoute()
const myAllSpecs = ref<ISpec[]>([])
const inSpecs = ref<ISpec[]>([])

async function load() {
  inSpecs.value = await useNuxtApp().$GET(`/spec/has/${type}/${route.params.id}`) as ISpec[]
}

onMounted(load)

async function loadMySpec() {
  myAllSpecs.value = await useNuxtApp().$GET('/spec/list') as never[]
}

async function addToSpec(id: string) {
  await useNuxtApp().$GET(`/spec/add/${id}/${type}/${route.params.id}`)
  await load()
}

async function createSpec() {
  const newSpec = await useNuxtApp().$POST(`/spec/create/${type}`, route.params.id) as ISpec
  await addToSpec(newSpec.id)
  navigateTo(`/servers/spec/${newSpec.id}`)
}


</script>

<template lang="pug">
  q-card
    q-toolbar
      q-toolbar-title Спецификации
    q-card-section
      div(v-for="spec of inSpecs")
        router-link(:to="`/servers/spec/${spec.id}`") {{ spec.name }}
    q-card-actions
      q-btn(color="primary" @click="loadMySpec") Добавить в спецификацию
        q-popup-proxy.q-pa-sm
          table
            tbody
              tr
                td Новая спецификация
                td
                  q-btn(icon="mdi-plus-circle-outline" @click="createSpec")
              tr(v-for="spec in myAllSpecs")
                td {{spec.name}}
                td
                  q-btn(icon="mdi-plus-circle-outline" @click="addToSpec(spec.id)" v-close-popup)

</template>

<style scoped>

</style>