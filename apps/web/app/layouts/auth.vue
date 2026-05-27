<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <NuxtLink to="/" class="text-2xl font-bold tracking-tight text-gray-900">
          List
        </NuxtLink>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <slot />
      </div>
    </div>
  </div>
</template>
