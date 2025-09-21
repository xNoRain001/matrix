<template>
  <UDrawer
    v-if="isMobile"
    :close="{ onClick: () => emit('close', false) }"
    :title="title"
    :description="description"
  >
    <template #body>
      <UTextarea
        v-model="content"
        :rows="5"
        :maxrows="5"
        autoresize
        class="w-full"
        maxlength="300"
        :ui="{ trailing: 'flex items-end' }"
      >
        <template v-if="content" #trailing>
          <div class="text-muted py-1.5 text-xs tabular-nums">
            {{ content.length }}/300
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
      <UButton
        label="草稿"
        color="neutral"
        class="justify-center"
        @click="onDraft"
      />
      <UButton label="提交" class="justify-center" @click="onFeedback" />
    </template>
  </UDrawer>
  <UModal
    v-else
    :close="{ onClick: () => emit('close', false) }"
    :title="title"
    :description="description"
  >
    <template #body>
      <UTextarea
        v-model="content"
        :rows="5"
        :maxrows="5"
        autoresize
        class="w-full"
        maxlength="300"
        :ui="{ trailing: 'flex items-end' }"
      >
        <template v-if="content" #trailing>
          <div class="text-muted py-1.5 text-xs tabular-nums">
            {{ content.length }}/300
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
      <UButton
        label="草稿"
        color="neutral"
        class="justify-center"
        @click="onDraft"
      />
      <UButton label="提交" class="justify-center" @click="onFeedback" />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

const emit = defineEmits<{ close: [boolean] }>()
const content = ref(localStorage.getItem('feedbackDraft') || '')
const { isMobile } = storeToRefs(useUserStore())
const title = '反馈'
const description = ' '

const onDraft = () => {
  if (content.value) {
    localStorage.setItem('feedbackDraft', content.value)
    emit('close', true)
  }
}

const onFeedback = () => {
  localStorage.removeItem('feedbackDraft')
  emit('close', true)
}
</script>
