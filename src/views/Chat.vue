<template>
  <UModal
    @after:leave="router.replace('/')"
    fullscreen
    title=" "
    description=" "
    v-model:open="isOpen"
    :ui="{ content: 'flex justify-center flex-row' }"
  >
    <template #content>
      <!-- <USlideover
        v-if="!isMobile"
        side="left"
        default-open
        :dismissible="false"
        :overlay="false"
        title="设置"
        description=" "
      >
        <template #content>
          <ProfileSpace
            :is-match="true"
            :select-contact-id="matchRes.id"
          ></ProfileSpace>
        </template>
      </USlideover> -->

      <ProfileSpace
        v-if="!isMobile"
        class="w-2/5"
        :is-match="true"
        :select-contact-id="matchRes.id"
      ></ProfileSpace>
      <MessageView
        v-if="targetId"
        @close="isOpen = false"
        :is-match="true"
        :target-id="matchRes.id"
      />
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMatchStore, useRecentContactsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'

const router = useRouter()
const { isMobile } = storeToRefs(useUserStore())
const { matchRes, matchType } = storeToRefs(useMatchStore())
const { targetId } = storeToRefs(useRecentContactsStore())
const isOpen = ref(Boolean(matchType.value === 'chat' && matchRes.value))
targetId.value = matchRes.value?.id || ''

onMounted(async () => {
  if (!isOpen.value) {
    return router.replace('/')
  }
})
</script>
