<script setup lang="ts">
const order = defineModel()
const {$listen,$event} = useNuxtApp()

const itemsForAdding = computed(() => {
  return order.value.items.filter((i: IOrderItem) => i.device?.powers?.length)
      .filter((i:IOrderItem)=>{
        return i.powerItemsCount < i.device.powerCount * i.count
      })
})


async function addPowers(item: IOrderItem, device: IDevice) {
  const add = {
    device,
    count: item.device.powerCount * item.count - item.powerItemsCount,
    item
  }
  await useNuxtApp().$POST(`/order/item/add/sub`, add)
  $event('order:reload')
}
</script>

<template lang="pug">

  Banner(v-for="item of itemsForAdding" :color="item.powerItemsCount ? item.device.powerCount * item.count> item.powerItemsCount  ? 'warning':'':'error'")
    div.flex.justify-between.items-center
      span Для "{{item.device.name}}" не хватает блоков питания {{item.device.powerCount * item.count - item.powerItemsCount}}
      div.flex
        div(v-for="(pwr,i2) of item.device.powers" :key="i2") &nbsp;
          q-btn(@click="addPowers(item, pwr)" small :label="pwr.name")
            q-tooltip {{pwr.description}}

</template>

<style scoped>

</style>