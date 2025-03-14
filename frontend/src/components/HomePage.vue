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

    await response.json().then(response => {
        lists.value = response.map((list) => (
            {
                ...list,
                showItems: false
            }))
    })

    console.log('lists.value', lists.value)

    loading.value = false
})


</script>

<template>
    <div class="w-full mx-auto p-4">
        <div v-if="loading">Loading...</div>
        <div v-else class="w-full">
            <div class="w-full grid grid-cols-4 gap-4 text-lg">
                <div
                    v-for="list in lists"
                    :key="list.id"
                     class="flex flex-col h-fit cursor-pointer rounded-lg border border-slate-200 shadow p-4 hover:ring hover:ring-slate-100"
                    @click="() => list.showItems = !list.showItems"
                >
                    <div
                        class="flex justify-between"
                    >
                        <div>{{ list.listName }}</div>
                        <div class="text-2xl" v-show="list.items.length">
                            {{ list.showItems ? '-' : '+' }}
                        </div>
                    </div>
                    <div
                        v-show="list.showItems"
                        class="p-4"
                    >
                        <div
                            v-for="listItem in list.items"
                            :key="listItem.id"
                            class="p-2 text-base"
                        >
                            {{ listItem.itemName }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>