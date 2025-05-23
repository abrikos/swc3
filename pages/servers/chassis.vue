<script setup lang="ts">
import {storeToRefs} from "pinia";
import {useCustomStore} from "~/store/custom-store";

const route = useRoute()
const {loggedUser} = storeToRefs(useCustomStore())
const list = ref([])
const showHidden = ref(false)
const {$listen} = useNuxtApp()
$listen('chassis:reload', () => {
  load()
})

onMounted(load)

async function load() {
  if (!route.query.platform) {
    navigateTo({query: {platform: 'G2', ...route.query}})
  }
  list.value = await useNuxtApp().$GET('/chassis/list') as never[]
}

//watch(()=>route.query.tab, load)

const tabsList = [
  {label: 'Intel Gen2', name: 'G2'},
  {label: 'Intel Gen3', name: 'G3'},
  {label: 'AMD', name: 'AMD'},
  {label: 'Дисковые полки (JBOD)', name: 'JBOD'},
  {label: 'Intel Gen2R', name: 'G2R'},
  {label: 'Intel Gen3R', name: 'G3R'},
  {label: 'Intel Gen4', name: 'G4'},
]

const listByPlatform = computed(() => list.value?.filter((i: any) => i.platform === (route.query.platform || 'G2')))

</script>

<template lang="pug">
  Tabs(:items="tabsList" param="platform")
  div.flex.justify-center
    ChassisCard(v-for="item in listByPlatform.filter((i: any) => !i.hidden)" :chassis="item")
  div(v-if="loggedUser.isAdmin")
    q-toggle(v-model="showHidden" label="Показывать скрытые" )
    div(v-if="showHidden")
      h4.text-center Скрытые
      div.flex.justify-center
        ChassisCard(v-for="item in listByPlatform.filter((i: any) => i.hidden)" :chassis="item")
        //ChassisCard(v-for="item in listByPlatform.filter((i: any) => !i.hidden)" :key="item.name" )


</template>

<style scoped lang="sass">
</style>