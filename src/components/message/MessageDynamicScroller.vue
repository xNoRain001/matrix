<template>
  <DynamicScroller
    :items="filteredItems"
    :min-item-size="44"
    :emit-update="true"
    ref="msgContainerRef"
    class="h-full p-4 sm:p-6"
    @update="onUpdate"
    @click="onClickAvatar"
    @scroll="onScroll"
  >
    <template #after>
      <div
        v-if="lastMsgMap[targetId]?.timeAgo"
        class="text-xs"
        :class="lastMsgMap[targetId]?.sent ? 'mr-13 flex justify-end' : 'ml-13'"
      >
        {{ lastMsgMap[targetId]?.timeAgo }}
      </div>
    </template>
    <template #default="{ item, active }">
      <DynamicScrollerItem v-if="active" :item="item" :active="active">
        <div v-if="item.type === 'label'" class="pt-3 pb-4 text-center text-sm">
          {{ formatTimestamp(item.timestamp) }}
        </div>
        <template v-else-if="item.type === 'text'">
          <div
            v-if="item.sent"
            class="flex items-center justify-end gap-3 pb-1"
          >
            <div
              class="max-w-3/4 rounded-xl bg-(--ui-bg-muted) px-4 py-2 break-words whitespace-pre-wrap"
            >
              {{ item.content }}
            </div>
            <UAvatar
              v-if="item.separator"
              :alt="userInfo.nickname[0] || ''"
              size="xl"
            />
            <div v-else class="w-10"></div>
          </div>
          <div v-else class="flex items-center gap-3 pb-1">
            <UAvatar
              data-type="avatar"
              v-if="item.separator"
              :alt="targetNickname"
              size="xl"
            />
            <div v-else class="w-10"></div>
            <div
              class="max-w-3/4 rounded-xl bg-(--ui-bg-muted) px-4 py-2 break-words whitespace-pre-wrap"
            >
              {{ item.content }}
            </div>
          </div>
        </template>
        <template v-else-if="item.type === 'image'">
          <div
            v-if="item.sent"
            class="flex items-center justify-end gap-3 pb-1"
          >
            <div class="max-w-3/4 rounded-xl bg-(--ui-bg-muted) px-4 py-2">
              <img :width="item.width" :height="item.height" :src="item.url" />
            </div>
            <UAvatar
              v-if="item.separator"
              :alt="userInfo.nickname[0] || ''"
              size="xl"
            />
            <div v-else class="w-10"></div>
          </div>
          <div v-else class="flex items-center gap-3 pb-1">
            <UAvatar
              data-type="avatar"
              v-if="item.separator"
              :alt="targetNickname"
              size="xl"
            />
            <div v-else class="w-10"></div>
            <div class="max-w-3/4 rounded-xl bg-(--ui-bg-muted) px-4 py-2">
              <img
                crossorigin="anonymous"
                :width="item.width"
                :height="item.height"
                :src="item.url || item.ossURL"
                @load="onLoad($event, item.hash, item.ossURL, item.id)"
              />
            </div>
          </div>
        </template>
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
  <!-- 移动端匹配或聊天列表点击对方头像进入的空间 -->
  <USlideover v-model:open="isSpaceSlideoverOpen" title=" " description=" ">
    <template #content>
      <ProfileSpace
        v-if="isSpaceSlideoverOpen"
        :select-contact-id="targetId"
        @close="isSpaceSlideoverOpen = false"
      ></ProfileSpace>
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import { useGetDB, useGetMessages } from '@/hooks'
import { useMatchStore, useRecentContactsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps<{
  targetId: string
  isMatch: boolean
}>()
const { isMobile, userInfo } = storeToRefs(useUserStore())
const { matchRes } = storeToRefs(useMatchStore())
const {
  lastMsgMap,
  contactProfileMap,
  hashToBlobURLMap,
  msgContainerRef,
  messageList,
  lastFetchedId
} = storeToRefs(useRecentContactsStore())
const route = useRoute()
const isSpaceSlideoverOpen = ref(false)
const items = ref([])
const search = ref('')
const updateParts = ref({
  viewStartIdx: 0,
  viewEndIdx: 0,
  visibleStartIdx: 0,
  visibleEndIdx: 0
})
const targetNickname = computed(() =>
  props.isMatch
    ? matchRes.value.nickname[0]
    : lastMsgMap.value[props.targetId]?.profile?.nickname?.[0] ||
      contactProfileMap.value[props.targetId].profile.nickname[0]
)
const dateTimeFormatOptions: Intl.DateTimeFormatOptions = {
  // year: 'numeric',
  // month: 'long',
  // day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  weekday: 'long'
}
const filteredItems = computed(() => {
  if (!search.value) {
    return messageList.value
  }

  const lowerCaseSearch = search.value.toLowerCase()
  return items.value.filter(i =>
    i.message.toLowerCase().includes(lowerCaseSearch)
  )
})

const onScroll = e => {
  if (e.target.scrollTop === 0 && lastFetchedId.value) {
    useGetMessages(
      hashToBlobURLMap,
      messageList,
      lastFetchedId,
      props.targetId,
      true
    )
  }
}

const onUpdate = (
  viewStartIndex,
  viewEndIndex,
  visibleStartIndex,
  visibleEndIndex
) => {
  updateParts.value.viewStartIdx = viewStartIndex
  updateParts.value.viewEndIdx = viewEndIndex
  updateParts.value.visibleStartIdx = visibleStartIndex
  updateParts.value.visibleEndIdx = visibleEndIndex
}

const formatTimestamp = (timestamp: number) => {
  // TODO: 更久远的记录显示日期甚至年份
  return new Date(timestamp).toLocaleString('zh-CN', dateTimeFormatOptions)
}

const onLoad = async (e, hash, ossURL, id) => {
  // TODO: 删除
  if (!hash) {
    return
  }

  // 没有 ossURL，说明接收图片时本地数据库已经缓存过该图片，因此什么也不用做
  if (!ossURL) {
    return
  }

  const img = e.target
  const canvas = document.createElement('canvas')
  const { width, height } = img
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx?.drawImage(img, 0, 0, width, height)
  const extname = img.src.split('.').pop()
  canvas.toBlob(
    async blob => {
      const db = await useGetDB()
      const tx = db.transaction('files', 'readwrite')
      await tx.objectStore('files').put({ hash, blob })
      await tx.done
      const _hashToBlobURLMap = hashToBlobURLMap.value
      if (_hashToBlobURLMap.size < 100) {
        _hashToBlobURLMap.set(hash, URL.createObjectURL(blob))
      }
      // 不再需要 ossURL
      const tx2 = db.transaction('messages', 'readwrite')
      const record = await tx2.objectStore('messages').get(id)
      delete record.ossURL
      await tx2.objectStore('messages').put(record)
      await tx2.done
    },
    `image/${extname === 'jpg' ? 'jpeg' : extname}`
  )
}

const onClickAvatar = e => {
  const { target } = e

  if (
    (target.getAttribute('data-type') ||
      target.children[0]?.getAttribute('data-type')) &&
    // 如果 contacts 中点击用户打开的空间中打开了聊天界面，聊天界面中点击
    // 对方头像不显示对方空间
    route.path !== '/contacts' &&
    // PC 端的匹配聊天界面中点击对方头像不显示对方空间
    !(props.isMatch && !isMobile.value)
  ) {
    isSpaceSlideoverOpen.value = true
  }
}
</script>
