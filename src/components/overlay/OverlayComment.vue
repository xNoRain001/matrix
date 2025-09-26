<template>
  <UDrawer
    :handle="false"
    title="发表评论"
    description=" "
    :ui="{
      footer: 'justify-between flex-row'
    }"
  >
    <template #body>
      <UTextarea
        placeholder="善语结缘，温暖常伴..."
        v-model="comment"
        class="w-full"
        :rows="3"
        :maxrows="3"
        autoresize
        variant="none"
        :ui="{ base: 'p-0' }"
      ></UTextarea>
    </template>
    <template #footer>
      <div>
        <UButton variant="ghost" icon="lucide:image"></UButton>
        <UButton variant="ghost" icon="lucide:smile"></UButton>
      </div>
      <UButton label="发布"></UButton>
    </template>
  </UDrawer>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const comment = ref('')
</script>
