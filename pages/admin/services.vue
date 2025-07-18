<script setup lang="ts">
const $q = useQuasar()
const services = ref<IService[]>([])
const {$listen} = useNuxtApp()

async function load() {
  services.value = await useNuxtApp().$GET('/admin/services') as IService[];
  console.log($q.screen.lt.md)
}

$listen('load-services', load)
onMounted(load)
const columns = [
  {field: 'name', label: 'Описание'},
  {field: 'level', label: 'Уровень'},
  {field: 'coefficient', label: 'Коэффициент'},
  {field: 'period', label: 'Период'},
  {field: 'controls', label: ''},
].map(item => ({...item, name: item.field}))

async function update(row: IService) {
  await useNuxtApp().$POST('/admin/services-update', row)
  console.log(row)
}

const service = ref({})
const addDialog = ref(false)

async function add() {
  await useNuxtApp().$POST('/admin/services-add', service.value)
  await load()
}

const levels = ['ADV', 'PRE', 'BAS']
</script>

<template lang="pug">
  q-toolbar
    q-toolbar-title Список сервисов
    q-btn(icon="mdi-plus" @click="addDialog=true")
      q-tooltip Добавить сервис
    q-dialog(v-model="addDialog")
      q-card
        q-form(@submit.prevent="add")
          q-toolbar
            q-toolbar-title Добавить сервис
          q-card-section
            q-input(v-model="service.name" label="Описание" :rules="[$validateRequired]")
            q-select(v-model="service.level" label="Уровень" :options="levels" :rules="[$validateRequired]")
            q-input(v-model="service.coefficient" label="Коэффициент" type="number" :min="0" :max="1" :step="0.05" :rules="[$validateRequired]")
            q-input(v-model="service.period" label="Период"  type="number" :min="3" :max="5" :rules="[$validateRequired]")
          q-card-actions
            q-btn(type="submit" label="Сохранить" color="primary" )
            q-btn(label="Отмена" @click="service={};addDialog=false" )
  q-table(:rows="services" :columns="columns" :pagination="{rowsNumber:100, rowsPerPage:100}" )
    template(v-slot:body="{row}")
      tr
        td
          q-input(v-model="row.name" @update:model-value="update(row)")
        td
          q-select(v-model="row.level" :options="levels" @update:model-value="update(row)")
        td
          q-input(v-model="row.coefficient" type="number" :min="0" :max="1" :step="0.05" @update:model-value="update(row)")
        td
          q-input(v-model="row.period" type="number" :min="3" :max="5" @update:model-value="update(row)")
        td
          DeleteButton(path="/admin/services-delete" :name="row.name" event="load-services" :id="row.id" @update:model-value="update(row)")

</template>

<style scoped>

</style>