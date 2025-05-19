<script setup lang="ts">
const tabs = ['Мои', 'Общие', 'Все'].map((name: string) => ({name}))

const route = useRoute()
if (!route.query.specs) {
  navigateTo({query: {specs: 'Мои'}})
}

watch(() => route.query.specs, makeFilter)
onMounted(makeFilter)

function makeFilter() {
  switch (route.query.specs) {
    case 'Мои':
      filter.value = {shared: {$eq: null}}
      break
    case 'Общие':
      filter.value = {shared: {$ne: null}}
      break;
    default:
      filter.value = {all: true}
  }

}

const filter = ref()
</script>

<template lang="pug">
Tabs(:items="tabs" param="specs" )
SpecList(v-model="filter")
</template>

<style scoped>

</style>