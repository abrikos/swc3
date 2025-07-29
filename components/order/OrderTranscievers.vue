<script setup lang="ts">
const order = defineModel()

const itemsWithoutTrans = computed(() => {
  return order.value.items.filter((i: IOrderItem) => i.device?.trans?.length)
      .filter((i:IOrderItem)=>{
        const trans = order.value.items.filter((s:IOrderItem)=>s.transForDevice).map((i:IOrderItem)=>i.sortName)
        return !trans.includes(i.device.name)
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
async function addTrans(trans:IDevice) {
  const add = {device: trans, count: 1, sortName:selected.value?.device.name, transForDevice:selected.value?.device, notDevice:true}
  const exists = order.value.items.find((i:IOrderItem) => i.device?.id === trans.id)
  if (exists) {
    exists.count++
  } else {
    order.value.items.push(add)
  }
  showDialog.value=false
}
const showDialog = ref(false)

</script>


<template lang="pug">
  Banner(color="success" v-for="item of itemsWithoutTrans" )
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