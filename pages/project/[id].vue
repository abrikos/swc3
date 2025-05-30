<script setup lang="ts">

const route = useRoute()
const project = ref<IProject>()
const managers = ref<IManager[]>()
async function load(){
  project.value = await useNuxtApp().$GET(`/project/${route.params.id}`) as IProject
  managers.value = await useNuxtApp().$GET(`/project/managers`) as IManager[]
}
onMounted(load)
const companies = ref([])
async function companyByInn() {
  companies.value = await useNuxtApp().$POST(`/user/inn`, project.value) as never[]
}

async function update() {
  await useNuxtApp().$POST(`/project/${route.params.id}`, project.value)
}
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
  div(v-if="project")
    q-toolbar
      q-toolbar-title {{project.name}}
      span Сумма:&nbsp;
        strong {{$priceFormat($priceByCurrencyServer(project.priceServer) + $priceByCurrencyNet(project.priceNet))}}
      ExcelButton(:id="project.id" path="/project")
      ExcelButton(:confidential="true" :id="project.id" path="/project")
    div.row
      div.col.q-px-sm
        ProjectForm(v-model="project" :submit="update")
      div.col.q-px-sm
        AddToSpec(type="project")
        br
        q-card
          q-toolbar
            q-toolbar-title Файлы
          q-card-section
            div.row
              div.col.q-px-sm
                div(v-for="file of project.files")
                  a(:href="`/api/project/file/${file.id}`") {{file.name}}

              div.col.q-px-sm
                q-uploader(auto-upload label="Загрузить" :url="`/api/project/upload/${project.id}`" @uploaded="uploaded" @failed="rejected")
                div {{response}}
                div {{fail}}

</template>

<style scoped>

</style>