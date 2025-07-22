<template>
  <div class="absolute top-4 left-4 flex flex-col">
    <q-breadcrumbs class="text-primary mt-4 cursor-pointer">
      <q-breadcrumbs-el label="返回" icon="arrow_back_ios_new" @click="back">
      </q-breadcrumbs-el>
    </q-breadcrumbs>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  back: () => void
}>()
</script>
