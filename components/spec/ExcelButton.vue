<script setup lang="ts">
const {confidential, spec} = defineProps({
  confidential: {type: Boolean},
  spec: {type: String},
})

async function download() {
  document.location.href = (`/api/spec/${spec}/excel?confidential=${confidential?1:0}`)
}

</script>

<template lang="pug">
  q-btn(icon="mdi-microsoft-excel" @click.stop="download" :color="confidential? 'red': 'green'" )
    //a.q-btn(:href="`/api/spec/${spec}/excel?confidential=${confidential?1:0}`")
    //q-icon(name="mdi-microsoft-excel")
    q-tooltip {{confidential ? 'Выгрузить в Excel конфидециально':'Выгрузить в Excel'}}

</template>

<style scoped>

</style>