<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const item = ref()
const categories = ref()
const {$listen, $event} = useNuxtApp()

async function load() {
  categories.value = await useNuxtApp().$GET('/order/categories')
  item.value = await useNuxtApp().$GET(`/order/item/${route.params.id}`)
  if (item.value.device.subcategory.name.match('точки доступа')) {
    item.value.device.tabs.push({name: 'licenses', label: 'Лицензии', icon: 'mdi-license'})
    item.value.device.licenses = await useNuxtApp().$GET('/order/wifi-licenses')
  }
  if (!route.query.tab) {
    router.push({query: {tab: item.value.device.tabs[0].name}});
  }
}

onMounted(load)
const tab = ref()

async function addSub(count: number, device: IDevice|null, tab: string) {
  const add = {
    device,
    count,
    item: item.value,
  }
  if(tab==='services'){
    add.device = null
    add.service = device
  }
  await useNuxtApp().$POST(`/order/item/add/sub`, add)
  //$event('order:reload')
  await load()
}

function counts(d: IDevice) {
  const exists = item.value.subItems.find(s => s.device ? s.device.id === d.id :s.service?.id === d.id )
  return exists ? exists.count : 0
}
</script>

<template lang="pug">
  div(v-if="item")
    q-toolbar.bg-grey-4
      q-toolbar-title
        router-link.text-blue(:to="`/network/order/${item.order.id}`" icon="mdi-eye") {{item.order.name}}
      span {{$priceFormat($priceByCurrencyNet(item.order.total))}}
    q-card.q-ma-sm
      q-card-section
        div.flex.justify-between
          div.text-h4 {{item.device.name}}
          div {{ item.device.description }}
    div.row
      div.col-sm-9
        q-tabs(v-model="tab"  dense no-caps indicator-color="primary" outside-arrows  mobile-arrows)
          q-route-tab(v-for="t of item.device.tabs" :label="t.label" :name="t.name" :to="{query:{tab:t.name}}" :icon="t.icon")
        q-tab-panels(v-model="tab" animated swipeable )
          q-tab-panel(v-for="t of item.device.tabs" :name="t.name" )
            table
              tbody
                tr(v-for="d of item.device[t.name]")
                  td {{d.name}}
                    br
                    small {{d.description}}
                  td(width="5%")
                    input(
                      v-if="t.name==='services'"
                      @change="addSub(counts(d)?0:item.count,d,'services')"
                      type="checkbox"
                      :checked="counts(d)"
                      :disabled="!counts(d) && item.subItems.filter(s=>s.service).length"
                      )
                    input(v-else :value="counts(d)" @change="e=>addSub(e.target.value,d, t.name)" type="number" min="0" style="width:50px" :step="item.count")
                  td.text-right(width="10%") {{$priceFormat($priceByCurrencyNet(d.price))}}
                  td.text-right(width="10%") {{$priceFormat($priceByCurrencyNet(d.price * counts(d)))}}
      div.col
        q-banner.bg-red.text-white(v-if="item.device.tabs.map(t=>t.name).includes('powers') && item.powerItemsCount < item.device.powerCount * item.count")
          span Не хватает блоков питания: {{item.device.powerCount * item.count - item.powerItemsCount}}

</template>

<style scoped>

</style>