<script setup lang="ts">

import { onMounted, ref } from "vue";

const lists = ref([])



onMounted(async () => {
    const response = await fetch('http://localhost:3000/lists')

    const json = await response.json()

    console.log('json', json)
})


</script>

<template>



</template>

<style scoped>

</style>