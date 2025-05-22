<script setup lang="ts">
const tabs = ['Мои', 'Общие'].map((name: string) => ({name}))

const route = useRoute()
// if (!route.query.specs) {
//   navigateTo({query: {specs: 'Мои'}})
// }

</script>

<template lang="pug">
//Tabs(:items="tabs" param="specs" )
SpecList
</template>

<style scoped>

</style>