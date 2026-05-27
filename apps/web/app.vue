<script setup lang="ts">
const { locale } = useI18n();

useHead({
  htmlAttrs: computed(() => ({
    dir: locale.value === "fa" ? "rtl" : "ltr",
    lang: locale.value,
  })),
});
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
