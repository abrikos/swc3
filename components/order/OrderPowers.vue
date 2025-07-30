<script setup lang="ts">
const order = defineModel()
const errors = ref<any[]>([])
const warnings = ref<any[]>([])
const {$listen} = useNuxtApp()
$listen('power:check', checkErrors)
onMounted(checkErrors)

function checkErrors() {
  setTimeout(() => {
    errors.value = []
    warnings.value = []
    for (const item of order.value.items) {
      const powerForDevice = order.value.items.filter((i: IOrderItem) => i.powerForDevice?.id === item.device?.id).reduce((a: number, b: IOrderItem) => a + b.count, 0)

      if (item.device?.powerCount > powerForDevice) {
        errors.value.push({item, needed: item.device?.powerCount * item.count - powerForDevice})
      }
      if (item.device?.powerCount < powerForDevice) {
        warnings.value.push({item, needed: item.device?.powerCount * item.count - powerForDevice})
      }
      //console.log(item.device.name, powerForDevice)
    }
  }, 200)
}

async function addPowers(item: IDevice, pwr: IDevice, err: any) {
  //await this.$axios.$put(`/network/order/${this.order.value.id}/power`, {item,pwr,err})
  const add = {
    device: pwr,
    count: err.needed,
    sortName: err.item.device?.name,
    powerForDevice: err.item.device,
    notDevice: true
  }
  // const exists = order.value.items.find((i: IOrderItem) => i.device?.id === pwr.id)
  // if (exists) {
  //   exists.count = exists.count * 1 + err.needed * 1
  // } else {
  //   order.value.items.push(add)
  // }
  order.value.items.push(add)
  checkErrors()
}
</script>

<template lang="pug">
  Banner(v-for="err of errors" :color="err.needed>=2?'error':'warning'")
    div.flex.justify-between.items-center
      span Для "{{err.item.device.name}}" требуются блоки питания {{err.powerNames}} в количестве {{err.needed}}
      div.flex
        div(v-for="(pwr,i2) of err.item.device.powers" :key="i2") &nbsp;
          q-btn(@click="addPowers(err.item, pwr,err)" small :label="pwr.name")
            q-tooltip {{pwr.description}}

</template>

<style scoped>

</style>