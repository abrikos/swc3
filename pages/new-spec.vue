<script setup lang="ts">
import {useCustomStore} from "~/store/custom-store";
import icons from "~/pages/network/net-cat-icons"

const categories = ref()

async function load() {
  categories.value = await useNuxtApp().$GET('/order/categories')
  categories.value.unshift(server)
}

onMounted(load)
const {loggedUser} = useCustomStore()

const server = {name: 'Серверы', server: 1}
</script>

<template lang="pug">
  div.flex
    div(v-for="category in categories")
      q-card.q-ma-sm(v-if="category.server || loggedUser.isNetwork" style="width: 200px; height:200px" @click="navigateTo(category.server ? '/servers/chassis':`/network/choose?cat=${category.id}`)")
        q-card-section.text-center
          q-icon(:name="icons[category.name]" size="70px" color="primary")
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