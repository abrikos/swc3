<script setup lang="ts">
import getTabs from './tabs'
import {storeToRefs} from "pinia";
import {useCustomStore} from "~/store/custom-store";
import ConfBasket from "~/components/conf/ConfBasket.vue";
import confValidator from "~/plugins/logic/logic-validator";
import EditButton from "~/components/EditButton.vue";
import EditField from "~/components/EditField.vue";

const {loggedUser} = storeToRefs(useCustomStore())
const route = useRoute()
const tabsArray = ref()
const conf = ref<IConf>()
const error404 = ref()
const components = ref<IComponent[]>([])
const edit = ref(false)
const specs = ref<ISpec[]>([])
const {$listen} = useNuxtApp()
onMounted(load)
$listen('conf:reload', load)

async function load() {
  const data = await useNuxtApp().$GET(`/conf/${route.params.id}`) as {conf: IConf, components:IComponent[]}
  if (!data.conf) {
    error404.value = '404 Конфигурация не найдена'
    return
  }
  conf.value = data.conf
  components.value = data.components
  tabsArray.value = getTabs(data.conf)
}

watch(() => route.query.category, () => {
  const cat = tabsArray.value.find((c: any) => c.name === route.query.category)
  if (cat?.children) {
    if(!route.query.type) {
      navigateTo({query: {category: cat.name, type: cat.children[0].name}})
    }
  }else{
    navigateTo({query: {category: cat.name}})
  }
})
const $q = useQuasar()
async function update() {
  await useNuxtApp().$POST(`/conf/update/${route.params.id}`, conf.value)
  //$q.notify({message:'aaaa', color: 'green'})


}

const tabsArrayType = computed(() => {
  const category = tabsArray.value?.find((item: any) => item.name === route.query.category)
  return category?.children || []
})

const confColor = computed(()=>conf.value?.powerCoefficient === 0 ? '' : conf.value?.powerCoefficient < 70 ? 'green'
    :
    conf.value?.powerCoefficient < 85 ? 'orange'
        : 'red')
</script>

<template lang="pug">
  div(v-if="conf" )
    q-toolbar
      q-toolbar-title.cursor-pointer {{conf.name}}
        EditField(v-model="conf.name" :update="update")
    div.row
      div.col-sm.q-pa-sm
        Tabs(:items="tabsArray" param="category" )
        Tabs(:items="tabsArrayType" param="type" )
        ConfService(v-if="route.query.category==='Services'" :conf="conf")
        ConfTable(v-else :conf="conf" :components="components")
      div.col-sm.q-pa-sm
        div {{conf.chassis.platform}} {{conf.chassis.descFull}}

        AddToSpec(type="conf")


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
              td(:class="`bg-${confColor}`")  {{ conf.powerCoefficient.toFixed(0) }}%

        ConfBasket(:conf="conf")
  div(v-else)
    h1.text-red.text-center {{error404}}
</template>

<style scoped lang="sass">
.power
  td
    text-align: center
</style>