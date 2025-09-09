<template>
  <div class="divide-default divide-y overflow-y-auto">
    <div v-for="id in lastMsgList" :key="id">
      <div
        class="flex cursor-pointer items-center gap-4 border-l-2 p-4 text-sm transition-colors sm:px-6"
        :class="[
          targetId === id
            ? 'border-primary bg-primary/10 text-highlighted'
            : 'hover:border-primary hover:bg-primary/5 text-toned border-(--ui-bg)'
        ]"
        @click="targetId = id"
      >
        <UChip
          inset
          color="error"
          :show="Boolean(lastMsgMap[id].unreadMsgs)"
          :text="lastMsgMap[id].unreadMsgs"
          size="3xl"
        >
          <UAvatar :text="lastMsgMap[id].profile.nickname[0]"></UAvatar>
        </UChip>

        <div class="w-[calc(100%-4rem)]">
          <!-- :class="[user.unread && 'font-semibold']" -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              {{ lastMsgMap[id].profile.nickname }}
              <!-- <UChip :color="Math.random() > 0.5 ? 'primary' : 'error'" /> -->
            </div>

            <span>{{ lastMsgMap[id].timeAgo }}</span>
            <!-- <span>{{ isToday(new Date(user.date)) ? format(new Date(user.date), 'HH:mm') : format(new Date(user.date), 'dd MMM') }}</span> -->
          </div>
          <p class="truncate">
            {{ lastMsgMap[id].content }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFormatTimeAgo } from '@/hooks'
import { useRecentContactsStore } from '@/store'
import { storeToRefs } from 'pinia'
import { onBeforeUnmount, onMounted, type Ref } from 'vue'

let timer = null
const targetId = defineModel() as Ref<string>
const { lastMsgMap, lastMsgList } = storeToRefs(useRecentContactsStore())

defineShortcuts({
  arrowdown: () => {
    const _lastMsgList = lastMsgList.value
    const index = _lastMsgList.findIndex(id => id === targetId.value)

    if (index === -1) {
      targetId.value = _lastMsgList[0]
    } else if (index < _lastMsgList.length - 1) {
      targetId.value = _lastMsgList[index + 1]
    }
  },
  arrowup: () => {
    const _lastMsgList = lastMsgList.value
    const index = _lastMsgList.findIndex(id => id === targetId.value)

    if (index === -1) {
      targetId.value = _lastMsgList[_lastMsgList.length - 1]
    } else if (index > 0) {
      targetId.value = _lastMsgList[index - 1]
    }
  }
})

const updateTimeAgo = () => {
  const _lastMsgList = lastMsgList.value
  const _lastMsgMap = lastMsgMap.value

  for (let i = 0, l = _lastMsgList.length; i < l; i++) {
    const item = _lastMsgMap[_lastMsgList[i]]
    item.timeAgo = useFormatTimeAgo(item.timestamp)
  }
}

onMounted(() => {
  updateTimeAgo()
  timer = setInterval(updateTimeAgo, 2 * 1000 * 60)
})

onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>
