<script setup lang="ts">
import moment from "moment";

const project = defineModel<IProject>({required:true})
const managers = ref<IManager[]>()

async function load() {
    managers.value = await useNuxtApp().$GET(`/project/managers`) as IManager[]
}

onMounted(load)
const companies = ref([])

async function companyByInn() {
  companies.value = await useNuxtApp().$POST(`/user/inn`, project.value) as never[]
}

const month = computed({
  get(){
    return moment(project.value.expireDate).format("MMM")
  },
  set(v){
    const date = moment(project.value.expireDate).set('date', 1)
    project.value.expireDate = date.month(v).toDate()
  }
})
const year = computed({
  get() {
    return moment(project.value.expireDate).format("YYYY")
  },
  set(v) {
    const date = moment(project.value.expireDate).set('date', 1)
    project.value.expireDate = date.year(v).toDate()
  }
})

async function update() {
  await useNuxtApp().$POST(`/project/${project.value.id}`, project.value)
}

</script>

<template lang="pug">
  q-card
    q-toolbar
      q-toolbar-title Параметры
    q-form(@submit.prevent="update")
      q-card-section
        q-input(v-model="project.inn" label="ИНН" :rules="[$validateRequired]" @update:model-value="companyByInn" hint="")
        q-option-group(v-if="companies.length" :options="companies" v-model="project.customer" option-label="value" @update:model-value="companies=[]" hint="")
        q-input(v-else v-model="project.customer" label="ИНН" :rules="[$validateRequired]" hint="")
        q-select(:options="managers" option-label="name" option-value="id" v-model="project.manager" hint="" )
        q-input(label="Отдел (РОП)" :value="project.manager?.dep" disabled  hint="" )
        q-input(label="Партнёр" v-model="project.partner" hint="" )
        q-input(label="Партнёр" v-model="project.distributor" hint="" )
        strong Срок реализации проекта
        div.row
          div.col
            q-select(label="Месяц" v-model="month" :rules="[$validateRequired]" :options="['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']" )
          div.col
            q-input(label="Год" v-model="year" :rules="[$validateRequired]" type="number" :min="2023")
        q-input(label="Дополнительные адреса оповещения (через запятую)" v-model="project.emails" )

      q-card-actions
        q-btn(label="Сохранить" color="primary" type="submit")

</template>

<style scoped>

</style>