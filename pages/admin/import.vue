<script setup lang="ts">
const files = ref()
async function load(){
  files.value = await useNuxtApp().$GET('/admin/import-list')
}
onMounted(load)
const types = [
  {title: 'Серверное оборудование', name: 'serv', file: 'servers.xlsx'},
  //{title: 'Cервисы', name: 'services', file: 'services_example.xlsb'},
  {title: 'Сетевое оборудование', name: 'net', file: 'network-price.xls'},
  {title: 'Совместимость трансиверов', name: 'trans', file: 'net-trans-example.xlsx'},
  {title: 'Менеджеры', name: 'manager', file: 'managers.xlsx'},
]
const response = ref()
const fail = ref()
function uploaded(e: {files:File[], xhr:XMLHttpRequest }){
  response.value = e.xhr.responseText
  load()
}

function rejected(e: {files:File[], xhr:XMLHttpRequest}) {
  fail.value = e.xhr.responseText
}
</script>

<template lang="pug">
  div.row
    div.col.q-ma-sm(v-for="(item,index) in types")
      q-uploader(auto-upload :label="item.title" :url="`/api/admin/import/${item.name}`" @uploaded="uploaded" @failed="rejected")
      span Пример файла
        a(:href="'/'+item.file" target="_blank") {{item.file}}
      //div {{item.name}}
      ul
        li(v-if="files" v-for="file of files.filter(f=>f.match(`import-${item.name}-`))" )
          a(:href="`/upload/excel/${file.replace('excel:','')}`" target="_blank") {{file.replace('excel:','')}}

  Banner(color="success" v-if="response") {{response}}
  Banner(color="error" v-if="fail") {{fail}}
  //q-card
    q-toolbar
      q-toolbar-title Загруженные файлы
    q-card-section
      div(v-if="files" v-for="file of files" )
        a(:href="`/upload/excel/${file.replace('excel:','')}`" target="_blank") {{file.replace('excel:','')}}
</template>

<style scoped>

</style>