<script setup lang="ts">

interface Props {
    modelValue: number | null
}

const props = defineProps<Props>()

</script>

<template>
    <div class="quantity-component flex items-center" v-if="modelValue">
        <div class="decrease-or-remove-button flex justify-center items-center border border-gray-500 rounded-full w-4 h-4 text-red-800 relative text-xs font-semibold opacity-0 hover:opacity-100 transition-opacity duration-200" @click="modelValue -= 1">
            <span class="absolute top-[-1.5px]"> {{ modelValue > 1 ? '-' : 'x' }} </span>
        </div>

        <div class="quantity-value flex justify-center w-8"> {{ modelValue > 1 ? modelValue : '' }} </div>

        <div class="increase-button flex justify-center items-center border border-gray-500 rounded-full w-4 h-4 text-green-800 relative text-xs font-semibold opacity-0 hover:opacity-100 transition-opacity duration-200" @click="modelValue += 1">
            <span class="absolute top-[-1.5px]">+</span>
        </div>
    </div>
</template>