<template>
  <DynamicScroller
    :items="filteredItems"
    :min-item-size="44"
    :emit-update="true"
    ref="msgContainerRef"
    class="h-full p-4 sm:p-6"
    @update="onUpdate"
    @click="onClick"
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
      <DynamicScrollerItem :item="item" :active="active">
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
            <img
              v-if="item.url"
              class="max-w-3/4"
              :width="item.width"
              :height="item.height"
              :src="item.url"
            />
            <UIcon v-else name="lucide:image-off" class="size-16"></UIcon>
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
            <img
              v-if="item.url || item.ossURL"
              data-type="image"
              class="max-w-3/4"
              crossorigin="anonymous"
              :width="item.width"
              :height="item.height"
              :src="item.url || item.ossURL"
              @load="onLoad($event, item)"
            />
            <UIcon v-else name="lucide:image-off" class="size-16"></UIcon>
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
  <!-- 图片预览器 -->
  <ModalViewer
    fullscreen
    v-model="isViewerModalOpen"
    :url="viewerURL"
  ></ModalViewer>
</template>

<script lang="ts" setup>
import { useGetDB, useGetMessages } from '@/hooks'
import { useMatchStore, useRecentContactsStore, useUserStore } from '@/store'
import { useThrottleFn } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps<{
  isMatch: boolean
}>()
const { isMobile, userInfo } = storeToRefs(useUserStore())
const { matchRes } = storeToRefs(useMatchStore())
const {
  targetId,
  lastMsgMap,
  contactProfileMap,
  hashToBlobURLMap,
  msgContainerRef,
  messageList,
  lastFetchedId,
  skipUnshiftMessageRecord
} = storeToRefs(useRecentContactsStore())
const route = useRoute()
const isSpaceSlideoverOpen = ref(false)
const isViewerModalOpen = ref(false)
const viewerURL = ref('')
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
    : lastMsgMap.value[targetId.value]?.profile?.nickname?.[0] ||
      contactProfileMap.value[targetId.value].profile.nickname[0]
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

const onScroll = useThrottleFn(
  async e => {
    if (
      !skipUnshiftMessageRecord.value &&
      e.target.scrollTop === 0 &&
      lastFetchedId.value
    ) {
      const unshiftCounter = await useGetMessages(
        userInfo.value.id,
        hashToBlobURLMap,
        messageList,
        lastFetchedId,
        targetId.value,
        true
      )

      if (unshiftCounter) {
        ;(msgContainerRef.value as any).scrollToItem(unshiftCounter)
      }
    }
  },
  200,
  true
)

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

const onLoad = async (e, item) => {
  const { hash, ossURL, id } = item

  // 没有 ossURL，如果是在线接收图片，说明内存中有该图片或本地数据库中有该图片，
  // 不是在线接收图片，那一定是查看过往图片时
  if (!ossURL) {
    return
  }

  // 存在 ossURL，如果是在线接收图片，说明本地数据库中没有该图片（内存中一定没有），
  // 不是在线接收图片，那一定是加载本地数据库中没有的离线图片

  // 因为图片从视图中滚动消失再滚动出现时也会触发 load，没有 ossURL 会被上面拦截，
  // 存在 ossURL 的图片保存到本地数据库后没有刷新页面或重新打开聊天界面的情况下
  // ossURL 是存在的，如果不是首次加载，不需要保存在本地数据库中，因此需要拦截，
  // 通过缓存判断是否已经保存到数据库中了，但如果缓存满了的话依然会触发之后的行为，
  // 还需要判断本地数据库中是否存在，这里先不处理判断本地数据库中的逻辑
  const _hashToBlobURLMap = hashToBlobURLMap.value

  if (_hashToBlobURLMap.has(hash)) {
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
      const db = await useGetDB(userInfo.value.id)
      const tx = db.transaction('files', 'readwrite')
      await tx.objectStore('files').put({ hash, blob })
      await tx.done

      if (_hashToBlobURLMap.size < 100) {
        _hashToBlobURLMap.set(hash, URL.createObjectURL(blob))
      }
      // 不再需要 ossURL
      const tx2 = db.transaction('messages', 'readwrite')
      const record = await tx2.objectStore('messages').get(id)
      delete record.ossURL
      await tx2.objectStore('messages').put(record)
      await tx2.done
      // 不需要从内存中删除 ossURL，因为图片已经显示，如果替换 url 会重新渲染，
      // 当刷新或者重新进入聊天界面时会使用基于本地数据库生成的 blob url
    },
    `image/${extname === 'jpg' ? 'jpeg' : extname}`
  )
}

const onClick = e => {
  const { target } = e
  const type =
    target.getAttribute('data-type') ||
    target.children[0]?.getAttribute('data-type')

  if (type === 'image') {
    isViewerModalOpen.value = true
    viewerURL.value = target.src
  } else if (
    type &&
    // 如果 contacts 中点击用户打开的空间中打开了聊天界面，聊天界面中点击
    // 对方头像不显示对方空间
    route.path !== '/contacts' &&
    // PC 端的匹配聊天界面中点击对方头像不显示对方空间
    !(props.isMatch && !isMobile.value)
  ) {
    isSpaceSlideoverOpen.value = true
  }
}

onBeforeUnmount(() =>
  (msgContainerRef.value as any).$el.removeEventListener('scroll', onScroll)
)
</script>
