<script setup lang="ts">
import {storeToRefs} from "pinia";
import {useCustomStore} from "~/store/custom-store";

const {loggedUser, settings} = storeToRefs(useCustomStore())
</script>

<template lang="pug">

</template>

<style scoped>

</style>