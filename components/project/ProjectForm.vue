<script setup lang="ts">
import moment from "moment";

const project = defineModel<IProject>({required: true})
const {submit} = defineProps({
  submit: {type: Function, required: true},
})
const managers = ref<IManager[]>()
const statuses = ref([])

async function load() {
  managers.value = await useNuxtApp().$GET(`/project/managers`) as IManager[]
  statuses.value = await useNuxtApp().$GET(`/project/statuses`) as never[]
}

onMounted(load)
const companies = ref([])

async function companyByInn() {
  companies.value = await useNuxtApp().$POST(`/user/inn`, project.value) as never[]
}


const months2 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(m => ({label: months2[m], value: m}))


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
        q-select(:options="managers" option-label="name" option-value="id" v-model="project.manager" :hint="project.manager?.dep" label="Менеджер" :rules="[$validateRequired]" bottom-slots)
        q-select(:options="statuses" v-model="project.status" label="Статус" bottom-slots)
        //q-input(label="Отдел (РОП)" v-model="project.manager.dep" disable  hint="" )
        q-input(label="Партнёр" v-model="project.partner" bottom-slots)
        q-input(label="Партнёр" v-model="project.distributor" bottom-slots)
        q-input(label="Дополнительные адреса оповещения (через запятую)" v-model="project.emails" bottom-slots)
        //div {{project.expireDate}}
        //q-date(v-model="project.expireDate")
        strong Месяц реализации проекта
        div.row
          div.col
            q-select(label="Месяц" v-model="project.month" :rules="[$validateRequired]" :options="months" option-value="value" option-label="label" map-options emit-value)
          div.col
            q-input(label="Год" v-model="project.year" :rules="[$validateRequired]" type="number" :min="2023")

      q-card-actions
        q-btn(label="Сохранить" color="primary" type="submit")

</template>

<style scoped>

</style>