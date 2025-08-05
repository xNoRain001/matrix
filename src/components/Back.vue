<template>
  <q-breadcrumbs class="text-primary text-base">
    <q-breadcrumbs-el
      class="cursor-pointer"
      label="返回"
      icon="arrow_back_ios_new"
      @click="back"
    >
    </q-breadcrumbs-el>
  </q-breadcrumbs>
</template>

<script lang="ts" setup>
defineProps<{
  back: () => void
}>()
</script>
