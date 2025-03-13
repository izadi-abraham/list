<script setup lang="ts">

import { onMounted, ref } from "vue";

const lists = ref([])
const loading = ref(false)



onMounted(async () => {
    // const response = await fetch('http://localhost:3000/lists')
    //

    loading.value = true

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

    // const response = await fetch('http://localhost:3000/lists/1/items', {
    //     method: 'POST',
    //     headers: {
    //         authorization: `Bearer ${token['access_token']}`,
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({
    //         "itemName": "Eggs",
    //         "quantity": 10,
    //         "unit": "no-unit",
    //         "category": "category",
    //         "notes": "buy good ones"
    //     })
    // })

    lists.value = await response.json()

    console.log('lists.value', lists.value)

    loading.value = false
})


</script>

<template>
    <div class="w-full mx-auto p-4">
        <div v-if="loading">Loading...</div>
        <div v-else class="w-full">
            <div class="text-2xl font-bold mb-4 text-red-500">Your Lists</div>
            <div class="w-full grid grid-cols-4 gap-4 text-xl text-red-500">
                <div v-for="list in lists" :key="list.id" class="bg-white rounded-lg shadow p-4">
                    {{ list.listName }}
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>