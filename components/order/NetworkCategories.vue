<script setup lang="ts">
import icons from "~/pages/network/net-cat-icons"

const items = defineModel<{ device: IDevice, count: number }[]>()
const {$event} = useNuxtApp()
const selected = ref()
const route = useRoute()
const categories = ref<ICategory[]>([])
const devices = ref<IDevice[]>([])

async function load() {
  categories.value = await useNuxtApp().$GET('/order/categories') as ICategory[]
  await getDevices()
}

async function getDevices() {
  if (!route.query.sub) return
  devices.value = await useNuxtApp().$GET('/order/devices/' + route.query.sub) as IDevice[]
}

watch(() => route.query.sub, getDevices)
onMounted(load)
const subcats = computed(() => categories.value?.find(c => c.id === route.query.cat)?.subcategories || [])

async function addDevice(device: IDevice) {
  if (route.params.id) {
    if (!route.query.device) {
      await useNuxtApp().$POST('/order/item/add', {device, count: 1, order: route.params.id})
    } else {
      await useNuxtApp().$POST('/order/item/add/sub', {
        item: {id: route.query.device},
        device,
        count: 1,
        order: route.params.id
      })
    }
    $event('order:reload')
  } else {
    const order = await useNuxtApp().$POST('/order/basket/save', [{device, count: 1}]) as IOrder
    if (order) {
      navigateTo({path: '/network/order/' + order._id, query: route.query})
    }
    // const exists = items.value?.find((i: any) => i.device.id === device.id)
    // if (exists) {
    //   exists.count++
    // } else {
    //   items.value?.push({device, count: 1})
    // }
  }
}

</script>

<template lang="pug">
  q-list
    q-item(v-for="category in categories")
      q-item-section(avatar)
        q-icon(:name="icons[category.name]" color="primary" size="30px")
      q-item-section
        router-link(:to="{query:{...route.query, cat:category.id}}") {{category.name}}
        div.subcat(v-for="sub in subcats" v-if="category.id === route.query.cat")
          router-link(:to="{query:{...route.query, sub:sub.id}}") {{sub.name}}
          div.device(v-for="device in devices" v-if="sub.id === route.query.sub" @click="addDevice(device)")
            q-tooltip(max-width="400px" ) {{device.description}}
            div.flex.items-center.justify-between
              div {{device.name}}
              //div
                q-btn(icon="mdi-plus-circle-outline")

</template>

<style scoped lang="sass">
a
  color: black

.subcat
  padding-left: 20px

.device
  padding-left: 20px
  border-bottom: 1px solid silver
//width: 400px
div
  cursor: pointer

div.selected
  cursor: default
</style>