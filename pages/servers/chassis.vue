<script setup lang="ts">
const route = useRoute()
const list = ref()
const columns = [
  {field: 'email', label: 'Email'},
  {name: 'actions', label: ''},
]
onMounted(load)

async function load() {
  if(route.query.tab) {
    list.value = await useNuxtApp().$GET('/chassis/list')
  }else{
    navigateTo({query:{tab:'G2'}})
  }
}

watch(()=>route.query.tab, load)

const tabs = [
  {label: 'Intel Gen2', name: 'G2'},
  {label: 'Intel Gen3', name: 'G3'},
  {label: 'AMD', name: 'AMD'},
  {label: 'Дисковые полки (JBOD)', name: 'JBOD'},
  {label: 'Intel Gen2R', name: 'G2R'},
  {label: 'Intel Gen3R', name: 'G3R'},
  {label: 'Intel Gen4', name: 'G4'},
]

const listByPlatform = computed(() => list.value?.filter((i: any) => i.platform === (route.query.tab || 'G2')))

</script>

<template lang="pug">
  Tabs(:items="tabs")
  div.flex.justify-center
    div.chassis(v-for="item in listByPlatform" :key="item.name" )
      img(:src="`/chassis/${item.id}.png`" onerror="this.src='/logo.png'")
      strong {{item.partNumber}} 22
      small {{item.params}}


</template>

<style scoped lang="sass">
.chassis
  border: 1px solid silver
  margin: 5px
  width: 200px
  padding: 5px
  text-align: center
  img
    max-width: 100%
  strong, small
    display: block
</style>