<script setup lang="ts">

const route = useRoute()
const project = ref<IProject>()
const managers = ref<IManager[]>()
async function load(){
  project.value = await useNuxtApp().$GET(`/project/${route.params.id}`) as IProject
  managers.value = await useNuxtApp().$GET(`/project/managers`) as IManager[]
}
onMounted(load)
const companies = ref([])
async function companyByInn() {
  companies.value = await useNuxtApp().$POST(`/user/inn`, project.value) as never[]
}

const projectForm = ref()
async function update() {
  await useNuxtApp().$POST(`/project/${route.params.id}`, project.value)
}

</script>

<template lang="pug">
  div(v-if="project")
    q-toolbar
      q-toolbar-title {{project.name}}
      span Сумма:&nbsp;
        strong {{$priceFormat($priceByCurrencyServer(project.priceServer) + $priceByCurrencyNet(project.priceNet))}}
    div.row
      div.col.q-px-sm
        ProjectForm(v-model="project")
      div.col.q-px-sm
</template>

<style scoped>

</style>