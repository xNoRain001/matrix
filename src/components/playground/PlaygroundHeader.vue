<template>
  <UDashboardNavbar title="广场" :ui="{ right: 'gap-3' }">
    <template #leading>
      <UDashboardSidebarCollapse />
    </template>

    <template #right>
      <UButton icon="lucide:bell" variant="ghost"></UButton>
    </template>
  </UDashboardNavbar>
</template>

<script lang="ts" setup></script>
