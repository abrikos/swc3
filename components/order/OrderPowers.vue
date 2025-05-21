<script setup lang="ts">
const {order} = defineProps({
  order: {type: Object, required: true},
})
function checkPowers(items:IOrderItem[]) {
  const errors = []
  const warnings = []
  for (const item of items) {
    const powerForDevice = items.filter(i => i.powerForDevice?.id === item.device?.id).reduce((a, b) => a + b.count, 0)

    if (item.device?.powerCount > powerForDevice) {
      errors.push({item, needed: item.device?.powerCount * item.count - powerForDevice})
    }
    if (item.device?.powerCount < powerForDevice) {
      warnings.push({item, needed: item.device?.powerCount * item.count - powerForDevice})
    }
    //console.log(item.device.name, powerForDevice)
  }
  return {errors, warnings}
}
</script>

<template lang="pug">
div {{checkPowers(order.items)}})
</template>

<style scoped>

</style>