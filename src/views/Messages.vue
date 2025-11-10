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
    <MessageList v-if="lastMsgList.length" />
    <div
      v-if="isMobile && !lastMsgList.length"
      class="flex flex-1 items-center justify-center"
    >
      <UIcon name="lucide:message-circle-more" class="text-dimmed size-32" />
    </div>
  </UDashboardPanel>
  <template v-if="!isMobile">
    <!-- 由于并不依赖模态框，因此需要手动修改 targetId -->
    <MatchToChatChat
      v-if="isChatOpen"
      @close="isChatOpen = false"
      :target-id="activeTargetId"
      :target-profile="activeTargetProfile"
    />
    <div v-else class="flex flex-1 items-center justify-center">
      <UIcon name="lucide:message-circle-more" class="text-dimmed size-32" />
    </div>
  </template>
</template>

<script setup lang="ts">
import { getProfiles } from '@/apis/profile'
import { useGetDB } from '@/hooks'
import { useRecentContactsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { onMounted, onBeforeUnmount } from 'vue'

let timer = null
const toast = useToast()
const { isMobile, userInfo } = storeToRefs(useUserStore())
const {
  isChatOpen,
  activeTargetId,
  activeTargetProfile,
  lastMsgMap,
  lastMsgList
} = storeToRefs(useRecentContactsStore())

const refreshChatsProfile = async () => {
  const now = Date.now()
  const { id } = userInfo.value
  const expired =
    now > Number(localStorage.getItem(`lastMsgProfileMapExpireAt-${id}`))

  // 过期，获取所有用户的最新资料
  if (expired) {
    const ids = lastMsgList.value

    if (!ids.length) {
      return
    }

    try {
      const { data: profileMap } = await getProfiles(ids.join('_'))
      const _lastMsgMap = lastMsgMap.value
      const db = await useGetDB(userInfo.value.id)
      const tx = db.transaction('lastMessages', 'readwrite')

      for (let i = 0, l = ids.length; i < l; i++) {
        const id = ids[i]
        _lastMsgMap[id].profile = {
          ..._lastMsgMap[id].profile,
          ...profileMap[id]
        }
        await tx
          .objectStore('lastMessages')
          .put(JSON.parse(JSON.stringify(_lastMsgMap[id])))
      }

      await tx.done

      localStorage.setItem(
        `lastMsgProfileMapExpireAt-${id}`,
        String(now + 1000 * 60 * 60 * 6)
      )
    } catch (error) {
      toast.add({
        title: error.message,
        color: 'error',
        icon: 'lucide:annoyed'
      })
    }
  }
}

onMounted(async () => {
  await refreshChatsProfile()
})

onBeforeUnmount(() => {
  clearInterval(timer)

  if (isChatOpen.value) {
    isChatOpen.value = false
    activeTargetId.value = ''
    activeTargetProfile.value = null
  }
})
</script>
