<script setup lang="ts">

import { onMounted, ref } from "vue";

const lists = ref([])



onMounted(async () => {
    // const response = await fetch('http://localhost:3000/lists')
    //


    const jwtToken = await fetch('http://localhost:3000/auth/test-token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: 1234 })
    })

    const token = await jwtToken.json()

    console.log('token', token)

    const response = await fetch('http://localhost:3000/lists', {
        method: 'GET',
        headers: {
            authorization: `Bearer ${token['access_token']}`
        }
    })

    const lists = await response.json()

    console.log('lists', lists)
})


</script>

<template>



</template>

<style scoped>

</style>