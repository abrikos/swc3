<script setup lang="ts">
import moment from "moment";

const project = defineModel<IProject>({required:true})
const {submit} = defineProps({
  submit:{type:Function, required: true},
})
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
  set(v:number) {
    const date = moment(project.value.expireDate).set('date', 1)
    project.value.expireDate = date.year(v).toDate()
  }
})


</script>

<template lang="pug">
  q-card
    q-toolbar
      q-toolbar-title Параметры
    q-form(@submit.prevent="submit")
      q-card-section
        q-input(v-model="project.inn" label="ИНН" :rules="[$validateRequired]" @update:model-value="companyByInn" bottom-slots)
        q-option-group(v-if="companies.length" :options="companies" v-model="project.customer" option-label="value" @update:model-value="companies=[]" bottom-slots)
        q-input(v-if="!companies.length"  v-model="project.customer" label="Компания" :rules="[$validateRequired]" bottom-slots)
        q-select(:options="managers" option-label="name" option-value="id" v-model="project.manager" :hint="project.manager?.dep" label="Менеджер" bottom-slots)
        //q-input(label="Отдел (РОП)" v-model="project.manager.dep" disable  hint="" )
        q-input(label="Партнёр" v-model="project.partner" bottom-slots)
        q-input(label="Партнёр" v-model="project.distributor" bottom-slots)
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