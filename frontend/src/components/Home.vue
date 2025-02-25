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

    // const response = await fetch('http://localhost:3000/lists', {
    //     method: 'POST',
    //     headers: {
    //         authorization: `Bearer ${token['access_token']}`,
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({
    //         "listType": "Grocery",
    //         "listName": "Weekly Shopping"
    //     })
    // })




    const response = await fetch('http://localhost:3000/lists/1/items', {
        method: 'POST',
        headers: {
            authorization: `Bearer ${token['access_token']}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "itemName": "Eggs",
            "quantity": 10,
            "unit": "no-unit",
            "category": "category",
            "notes": "buy good ones"
        })
    })

    const apiCallResponse = await response.json()

    console.log('apiCallResponse', apiCallResponse)
})


</script>

<template>

</template>

<style scoped>

</style>