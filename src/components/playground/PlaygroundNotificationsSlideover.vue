<template>
  <!-- 通知模态框 -->
  <USlideover
    :class="isMobile ? 'max-w-none' : ''"
    v-model:open="isNotificationSlideoverOpen"
    title="通知"
    description=" "
    :ui="{
      description: 'hidden'
    }"
  >
    <template #body>
      <UTabs :items="tabItems" v-model="activeTab" :content="false" />
      <Skeleton v-if="loading" :count="10" />
      <template v-else-if="activeTab === 'like' && likeNotifications">
        <div class="divide-default divide-y">
          <div
            v-for="{ _id, actors, count, updatedAt } in likeNotifications"
            :key="_id"
            class="cursor-pointer py-4 sm:py-6"
          >
            <div class="flex items-center gap-2">
              <UAvatarGroup size="xl">
                <UAvatar
                  v-for="({ nickname, user }, index) in actors"
                  :key="index"
                  :src="`${VITE_OSS_BASE_URL}avatar/${user}`"
                  :alt="nickname[0]"
                  @click="
                    profileSpaceOverlay.open({
                      targetId: user
                    })
                  "
                />
              </UAvatarGroup>
              <div class="min-w-0 flex-1">
                <div class="text-highlighted truncate font-medium">
                  <span
                    @click="
                      profileSpaceOverlay.open({
                        targetId: actors[0].user
                      })
                    "
                    >{{ actors[0].nickname }}</span
                  >
                  <template v-if="actors[1]">
                    、<span
                      @click="
                        profileSpaceOverlay.open({
                          targetId: actors[1].user
                        })
                      "
                      >{{ actors[1].nickname }}</span
                    >
                  </template>
                </div>
                <div class="text-muted flex justify-between gap-2 text-sm">
                  <span>
                    {{ count > 2 ? `等 ${count} 人` : '' }}点赞了你的内容
                  </span>
                  <time>{{ useFormatTimeAgo(updatedAt) }}</time>
                </div>
              </div>
              <!-- <img src="/images/logo.svg" class="size-10" /> -->
              <div
                class="text-muted bg-elevated flex size-10 items-center justify-center rounded-xl text-xs"
              >
                ...
              </div>
            </div>
          </div>
        </div>
        <Separator v-if="likeNotifications.length === 0" :label="'空空如也'" />
        <Separator v-else-if="allLikeLoaded" label="已经到底了" />
      </template>
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import { useFormatTimeAgo } from '@/hooks'
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store'
import { getNotificationsAPI } from '@/apis/notification'
import OverlayProfileSpace from '../overlay/OverlayProfileSpace.vue'

const isNotificationSlideoverOpen = defineModel<boolean>()
const { VITE_OSS_BASE_URL } = import.meta.env
const { isMobile } = storeToRefs(useUserStore())
const activeTab = ref('like')
const tabItems = [
  {
    label: '赞',
    value: 'like',
    icon: 'lucide:heart'
  },
  {
    label: '评论',
    value: 'comment',
    icon: 'lucide:message-circle'
  },
  {
    label: '收藏',
    value: 'star',
    icon: 'lucide:star'
  }
]
const likeNotifications = ref(null)
const loading = ref(true)
const allLikeLoaded = ref(false)
const overlay = useOverlay()
const profileSpaceOverlay = overlay.create(OverlayProfileSpace)

watch(isNotificationSlideoverOpen, async v => {
  if (v) {
    const { data } = await getNotificationsAPI('like')
    likeNotifications.value = data
    allLikeLoaded.value = data.length < 10
    loading.value = false
  }
})
</script>
