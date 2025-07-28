<script setup lang="ts">
import {useCustomStore} from "~/store/custom-store";

const {loggedUser} = useCustomStore()

const categories = [
  {name: 'Серверы', show: loggedUser?.isInternal, icon: 'mdi-server', server:1},
  {name: 'VoIP', show: loggedUser?.isInternal, icon: 'mdi-phone-voip'},
  {name: 'Wi-Fi решения', show: loggedUser?.isInternal, icon: 'mdi-wifi'},
  {name: 'Коммутаторы Enterprise', show: loggedUser?.isInternal, icon: 'mdi-switch'},
  {name: 'Коммутаторы SMB', show: loggedUser?.isInternal, icon: 'mdi-switch'},
  {name: 'Маршрутизаторы', show: loggedUser?.isInternal, icon: 'mdi-router-network'},
  {name: 'Оптические модули', show: loggedUser?.isInternal, icon: 'mdi-toslink'},
  {name: 'Оптические трансиверы xWDM', show: loggedUser?.isInternal, icon: 'mdi-toslink'},
]
</script>

<template lang="pug">
  div.flex
    div(v-for="category in categories")
      q-card.q-ma-sm(v-if="category.server || loggedUser.isEmployer" style="width: 200px; height:200px" @click="navigateTo(category.server ? '/servers/chassis':'/network/choose')")
        q-card-section.text-center
          q-icon(:name="category.icon" size="70px" color="primary")
          br
          br
          div {{ category.name }}
      //q-card-actions(v-if="loggedUser.isAdmin")
        q-btn(icon="mdi-image-edit" )

</template>

<style scoped lang="sass">
div
  cursor: pointer
</style>