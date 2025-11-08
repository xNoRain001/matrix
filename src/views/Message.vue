<template>
  <UDashboardPanel
    id="message-1"
    :default-size="25"
    :min-size="20"
    :max-size="30"
    resizable
    :class="isMobile ? 'pb-16' : ''"
  >
    <UDashboardNavbar title="消息">
      <template #leading>
        <UDashboardSidebarCollapse />
      </template>
      <template #trailing>
        <UBadge v-if="unreadMsgCounter" :label="unreadMsgCounter" size="sm" />
      </template>

      <template #right>
        <UButton
          @click="isLLMSlideoverOpen = true"
          icon="lucide:bot"
          variant="ghost"
        ></UButton>
        <UButton
          @click="onResetMsgCounter"
          icon="lucide:mail-check"
          variant="ghost"
        ></UButton>
        <!-- <UTabs
          v-model="activeTab"
          :items="tabItems"
          :content="false"
          size="xs"
        /> -->
      </template>
    </UDashboardNavbar>

    <MessageList v-if="lastMsgList.length" />
    <div
      v-if="isMobile && !lastMsgList.length"
      class="flex flex-1 items-center justify-center"
    >
      <UIcon name="lucide:message-circle-more" class="text-dimmed size-32" />
    </div>
  </UDashboardPanel>

  <!-- 由于并不依赖模态框，因此需要手动修改 targetId -->
  <MessageView
    v-if="!isMobile && activeTargetId"
    @close="activeTargetId = ''"
    :target-id="activeTargetId"
    :target-profile="activeTargetProfile"
  ></MessageView>
  <div
    v-if="!isMobile && !activeTargetId"
    class="flex flex-1 items-center justify-center"
  >
    <UIcon name="lucide:message-circle-more" class="text-dimmed size-32" />
  </div>

  <!-- LLM -->
  <MessageLLM v-model="isLLMSlideoverOpen"></MessageLLM>
</template>

<script setup lang="ts">
import { getProfiles } from '@/apis/profile'
import { useGetDB } from '@/hooks'
import { useRecentContactsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { onMounted, onBeforeUnmount, ref } from 'vue'

// const tabItems = [
//   {
//     label: '消息',
//     value: 'message'
//   },
//   {
//     label: '好友',
//     value: 'contact'
//   }
// ]
// const activeTab = ref('message')
let timer = null
const toast = useToast()
const { isMobile, userInfo } = storeToRefs(useUserStore())
const {
  unreadMsgCounter,
  activeTargetId,
  activeTargetProfile,
  lastMsgMap,
  lastMsgList
} = storeToRefs(useRecentContactsStore())
const isLLMSlideoverOpen = ref(false)

const onResetMsgCounter = async () => {
  const _lastMsgMap = lastMsgMap.value
  const keys = Object.keys(_lastMsgMap)
  const db = await useGetDB(userInfo.value.id)
  const tx = db.transaction('lastMessages', 'readwrite')

  for (let i = 0, l = keys.length; i < l; i++) {
    const item = _lastMsgMap[keys[i]]
    item.unreadMsgs = 0
    await tx.objectStore('lastMessages').put(JSON.parse(JSON.stringify(item)))
  }

  await tx.done
  unreadMsgCounter.value = 0
}

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
})
</script>
