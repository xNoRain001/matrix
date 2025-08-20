<template>
  <USlideover v-model:open="isMessagePanelOpen" title=" " description=" ">
    <template #header>
      <MessageHeader :user="selectUser"></MessageHeader>
    </template>
    <template #content></template>
    <template #body></template>
    <template #footer></template>
  </USlideover>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const selectUser = defineModel()
const isMessagePanelOpen = computed({
  get() {
    return Boolean(selectUser.value)
  },
  set(value: boolean) {
    if (!value) {
      selectUser.value = null
    }
  }
})
</script>
