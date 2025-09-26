<template>
  <USlideover
    title="发布"
    description=" "
    :ui="{
      footer: 'justify-between flex-row'
    }"
  >
    <template #body>
      <UTextarea
        placeholder="请尽情发挥吧..."
        v-model="content"
        class="w-full"
        autoresize
        variant="none"
        :rows="5"
        :maxrows="10"
        maxlength="2000"
        :ui="{ base: 'p-0', trailing: 'flex items-end' }"
      >
        <template v-if="content" #trailing>
          <div class="text-muted py-1.5 text-xs tabular-nums">
            {{ content.length }}/2000
          </div>
          <UButton
            color="neutral"
            variant="link"
            size="sm"
            icon="lucide:circle-x"
            @click="content = ''"
          />
        </template>
      </UTextarea>
    </template>
    <template #footer>
      <div>
        <UButton variant="ghost" icon="lucide:image"></UButton>
        <UButton variant="ghost" icon="lucide:smile"></UButton>
      </div>
      <div>
        <UButton label="草稿箱"></UButton>
        <UButton label="发布" class="ml-2"></UButton>
      </div>
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const content = ref('')
</script>
