<template>
  <UDashboardPanel
    id="message-1"
    :default-size="25"
    :min-size="20"
    :max-size="30"
    resizable
    :class="isMobile ? 'pb-16' : ''"
  >
    <MessageHeader />
    <Skeleton v-if="loading" :count="5" />
    <template v-else>
      <MessageList v-if="lastMsgList.length" />
      <div
        v-if="isMobile && !lastMsgList.length"
        class="flex flex-1 items-center justify-center"
      >
        <UIcon name="lucide:message-circle-more" class="text-dimmed size-32" />
      </div>
    </template>
  </UDashboardPanel>
  <template v-if="!isMobile">
    <!-- 由于并不依赖模态框，因此需要手动修改 targetId -->
    <MatchToChatChat
      v-if="isChatOpen"
      @close="onClose"
      :target-id="activeTargetId"
      :target-nickname="activeTargetNickname"
    />
    <div v-else class="flex flex-1 items-center justify-center">
      <UIcon name="lucide:message-circle-more" class="text-dimmed size-32" />
    </div>
  </template>
</template>

<script setup lang="ts">
import { refreshNickname } from '@/apis/profile'
import { useGetDB } from '@/hooks'
import { useRecentContactsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { onMounted, onBeforeUnmount, ref } from 'vue'

let timer = null
const toast = useToast()
const { isMobile, userInfo } = storeToRefs(useUserStore())
const {
  isChatOpen,
  activeTargetId,
  activeTargetNickname,
  lastMsgMap,
  lastMsgList
} = storeToRefs(useRecentContactsStore())
const loading = ref(
  lastMsgList.value.length &&
    Date.now() >
      Number(
        localStorage.getItem(`lastMsgProfileMapExpireAt-${userInfo.value.id}`)
      )
)

const refreshChatNickname = async () => {
  if (!loading.value) {
    return
  }

  const { id } = userInfo.value
  const ids = lastMsgList.value

  try {
    const { data: nicknameMap } = await refreshNickname(ids.join('_'))
    const _lastMsgMap = lastMsgMap.value
    const db = await useGetDB(userInfo.value.id)
    const tx = db.transaction('lastMessages', 'readwrite')

    for (let i = 0, l = ids.length; i < l; i++) {
      const id = ids[i]
      _lastMsgMap[id].profile.nickname = nicknameMap[id]
      await tx
        .objectStore('lastMessages')
        .put(JSON.parse(JSON.stringify(_lastMsgMap[id])))
    }

    await tx.done

    localStorage.setItem(
      `lastMsgProfileMapExpireAt-${id}`,
      String(Date.now() + 1000 * 60 * 60 * 6)
    )
  } catch (error) {
    toast.add({
      title: error.message,
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }

  loading.value = false
}

const onClose = () => {
  isChatOpen.value = false
  activeTargetId.value = ''
  activeTargetNickname.value = ''
}

onMounted(async () => {
  refreshChatNickname()
})

onBeforeUnmount(() => {
  clearInterval(timer)

  if (isChatOpen.value) {
    onClose()
  }
})
</script>
