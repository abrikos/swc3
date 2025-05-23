<script setup lang="ts">
import getTabs from './tabs'
import {storeToRefs} from "pinia";
import {useCustomStore} from "~/store/custom-store";
import ConfBasket from "~/components/conf/ConfBasket.vue";
import confValidator from "~/plugins/logic/logic-validator";

const {loggedUser} = storeToRefs(useCustomStore())
const route = useRoute()
const tabs = ref()
const conf = ref<IConf>()
const error404 = ref()
const components = ref<IComponent[]>([])
const edit = ref(false)
const specs = ref<ISpec[]>([])
const {$listen} = useNuxtApp()
onMounted(load)
$listen('conf:reload', load)

async function load() {
  const data = await useNuxtApp().$GET(`/conf/view/${route.params.id}`) as {conf: IConf, components:IComponent[], specs:ISpec[]}
  if (!data.conf) {
    error404.value = '404 Конфигурация не найдена'
    return
  }
  conf.value = data.conf
  components.value = data.components
  tabs.value = getTabs(data.conf)
  specs.value = data.specs
}

watch(() => route.query.category, () => {
  const cat = tabs.value.find((c: any) => c.name === route.query.category)
  if (cat?.children && !route.query.type) {
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

const mySpecs = ref([])
async function addToSpec(id:string){
  await useNuxtApp().$GET(`/conf/${conf.value?.id}/to-spec/${id}`)
  await load()
}
async function loadMySpec(){
  mySpecs.value = await useNuxtApp().$GET('/spec/list') as never[]
}
async function createSpec(){
  const newSpec = await useNuxtApp().$POST('/spec/create', conf.value) as ISpec
  navigateTo(`/servers/spec/${newSpec.id}`)
}


</script>

<template lang="pug">
  div(v-if="conf" )
    div(v-if="!edit" ).flex.justify-center
      strong.h1 {{conf.name}}
      div.flex.items-center
        q-btn(icon="mdi-pencil" color="secondary" @click="edit=true" round)
    q-input(v-else v-model="conf.name" @keydown.enter.prevent="update")
      template(v-slot:append)
        q-btn(icon="mdi-keyboard-return" color="primary" round @click="update")
        q-btn(icon="mdi-close" color="primary" round @click="edit=false")
    hr
    div.row
      div.col-8.q-pa-sm
        Tabs(:items="tabs" param="category" )
        Tabs(:items="tabsType" param="type" )
        ConfService(v-if="route.query.category==='Services'" :conf="conf")
        ConfTable(v-else :conf="conf" :components="components")
      div.col.q-pa-sm
        div {{conf.chassis.descFull}}

        div(v-if="specs.length" v-for="spec of specs")
          router-link(:to="`/servers/spec/${spec.id}`") {{ spec.name }}
        div(v-else)
          q-btn(color="primary" @click="loadMySpec") Добавить в спецификацию
            q-popup-proxy.q-pa-sm
              table
                tbody
                  tr
                    td Новая спецификация
                    td
                      q-btn(icon="mdi-plus-circle-outline" @click="createSpec")
                  tr(v-for="spec in mySpecs")
                    td {{spec.name}}
                    td
                      q-btn(icon="mdi-plus-circle-outline" @click="addToSpec(spec.id)")

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

        ConfBasket(:conf="conf")
  div(v-else)
    h1.text-red.text-center {{error404}}
</template>

<style scoped lang="sass">
.power
  td
    text-align: center
</style>