<script setup lang="ts">
import {storeToRefs} from "pinia";
import {useCustomStore} from "~/store/custom-store";

const items=['Рубли','USD'].map(item=>({label:item,value:item}))
const {loggedUser, settings} = storeToRefs(useCustomStore())

async function switchCurrency(currency:string){
  if(!loggedUser.value) return
  //loggedUser.value.currency = currency
  await useNuxtApp().$POST(`/user/update`, loggedUser.value)
}
</script>

<template lang="pug">
  q-option-group(v-if="loggedUser" :options="items"  type="radio" v-model="loggedUser.currency" @update:model-value="switchCurrency" inline dense)
  span &nbsp ({{settings?.course.toFixed(2)}})
  //q-btn-dropdown(v-if="loggedUser" :label="loggedUser.currency")
    q-list
      q-item(v-for="(item,idx) in items" @click="switchCurrency(item)" clickable v-close-popup)
        q-item-section
          q-item-label {{item}}
</template>

<style scoped>

</style>