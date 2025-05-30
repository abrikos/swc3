<script setup lang="ts">
const types = [
  {title: 'Серверное оборудование', name: 'serv', file: 'servers.xlsx'},
  {title: 'Cервисы', name: 'services', file: 'services_example.xlsb'},
  {title: 'Сетевое оборудование', name: 'net', file: 'network-price.xls'},
  {title: 'Совместимость трансиверов', name: 'trans', file: 'net-trans-example.xlsx'},
  {title: 'Менеджеры', name: 'manager', file: 'managers.xlsx'},
]
const response = ref()
const fail = ref()
function uploaded(e: {files:File[], xhr:XMLHttpRequest }){
  response.value = e.xhr.responseText
}

function rejected(e: {files:File[], xhr:XMLHttpRequest}) {
  fail.value = e.xhr.responseText
}
</script>

<template lang="pug">
  div.flex.justify-center
    div.q-ma-sm(v-for="(item,index) in types")
      q-uploader(auto-upload :label="item.title" :url="`/api/admin/import/${item.name}`" @uploaded="uploaded" @failed="rejected")
      span Пример файла
        a(:href="'/'+item.file" target="_blank") {{item.file}}
  Banner(color="success" v-if="response") {{response}}
  Banner(color="error" v-if="fail") {{fail}}
</template>

<style scoped>

</style>