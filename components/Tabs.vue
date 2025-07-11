<script setup lang="ts">
const route = useRoute()
const props = defineProps({
  items: {type: Object, required: true},
  param: {type: String, required: true},
})

function to(v: { name: string}) {
  const q = {query: {...route.query}}
  q.query[props.param] = v.name
  return q
}

</script>

<template lang="pug">
  q-tabs(active-color="primary" )
    q-route-tab(v-for="item of items"
      :name="item.name"
      :icon="param==='category' ? `img:/icons/${item.name}_icon.png`:''"
      :label="item.label || item.name"
      :to="to(item)"
      :no-caps="true"
      indicator-color="purple"
    )
</template>

<style scoped>

</style>