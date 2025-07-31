<script setup lang="ts">
const order = defineModel()
const {$listen,$event} = useNuxtApp()

const itemsForAdding = computed(() => {
  return order.value.items.filter((i: IOrderItem) => i.device?.trans?.length)
      .filter((i:IOrderItem)=>{
        return !i.subItems.map(s=>s.device?.name).filter(n=>i.device.trans.map(s=>s.name).includes(n)).length
      })
})

const transList = computed(() => {
  const ret =[]
  for(const d of order.value.items.filter((i: IOrderItem) => i.device?.trans.length)){
    ret.push(...d.device.trans)
  }
  return ret
})

const selected = ref()
async function addTrans(device:IDevice) {
  const add = {
    device,
    count: selected.value.count,
    item: selected.value,
  }
  await useNuxtApp().$POST(`/order/item/add/sub`, add)
  $event('order:reload')

  showDialog.value=false
}
const showDialog = ref(false)

</script>


<template lang="pug">
  Banner(color="success" v-for="item of itemsForAdding" )
    div.flex.justify-between.items-center
      div Для "{{ item.device.name }}" доступны транссиверы
      q-btn(label="Добавить трансивер" @click="showDialog=true; selected = item")
  Dialog(v-model="showDialog")
    table
      tbody
        tr
          th Артикул
          th(width="50%") Описание
          th Цена
          th
        tr(v-for="(trans,i) of transList" :key="i")
          td {{trans?.name}}
          td
            small {{trans?.description}}
          td
            q-btn(@click="addTrans(trans)" icon="mdi-plus-circle-outline")
</template>

<style scoped>

</style>