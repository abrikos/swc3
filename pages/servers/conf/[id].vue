<script setup lang="ts">
import getTabs from './tabs'
import {storeToRefs} from "pinia";
import {useCustomStore} from "~/store/custom-store";
import Basket from "~/components/conf/Basket.vue";
import confValidator from "~/plugins/logic/logic-validator";

const {loggedUser} = storeToRefs(useCustomStore())
const route = useRoute()
const tabs = ref()
const conf = ref()
const error404 = ref()
const components = ref([])
const edit = ref(false)
const {$listen} = useNuxtApp()
onMounted(load)
$listen('conf:reload', load)

async function load() {
  const data = await useNuxtApp().$GET(`/conf/view/${route.params.id}`)
  if (!data) {
    error404.value = '404 Конфигурация не найдена'
    return
  }
  conf.value = data.conf
  components.value = data.components
  tabs.value = getTabs(data.conf)
  if (!route.query.category) {
    navigateTo({query: {category: 'CPU'}})
  }
}

watch(() => route.query.category, () => {
  const cat = tabs.value.find((c: any) => c.name === route.query.category)
  if (cat.children && !route.query.type) {
    navigateTo({query: {category: cat.name, type: cat.children[0].name}})
  }
})

async function update() {
  await useNuxtApp().$POST(`/conf/update/${route.params.id}`, conf.value)
}

const tabsType = computed(() => {
  const category = tabs.value?.find((item: any) => item.name === route.query.category)
  return category?.children || []
})


</script>

<template lang="pug">
  div(v-if="conf" )
    div(v-if="!edit" ).flex.justify-center
      strong.h1 {{conf.name}}
      div.flex.items-center
        q-btn(icon="edit" color="secondary" @click="edit=true" round)
    q-input(v-else v-model="conf.name" @keydown.enter.prevent="update")
      template(v-slot:append)
        q-btn(icon="keyboard_return" color="primary" round @click="update")
        q-btn(icon="close" color="primary" round @click="edit=false")
    hr
    div.row
      div.col-8.q-pa-sm
        Tabs(:items="tabs" param="category" )
        Tabs(:items="tabsType" param="type" )
        ConfService(v-if="route.query.category==='Services'" :conf="conf")
        ConfTable(v-else :conf="conf" :components="components")
      div.col.q-pa-sm
        div {{conf.chassis.descFull}}
        q-banner.bg-red.text-white.q-mt-sm(v-for="err of confValidator(conf).errors" rounded) {{err}}
        q-banner.bg-orange.text-white.q-mt-sm(v-for="err of confValidator(conf).warnings" rounded) {{err}}

        table.full-width.q-mt-lg.power
          tbody
            tr(bgcolor="silver")
              th( colspan="3") Расчет электрической мощности
            tr
              td( v-if="loggedUser.isAdmin") Потребление (Вт)
              td Блок питания (Вт)
              td Коэффициент
            tr
              td( v-if="loggedUser.isAdmin") {{ conf.powerConsumption }}
              td {{ conf.power }}
              td {{ conf.powerCoefficient.toFixed(0) }}%

        Basket(:conf="conf")
  div(v-else)
    h1.text-red.text-center {{error404}}
</template>

<style scoped lang="sass">
.power
  td
    text-align: center
</style>