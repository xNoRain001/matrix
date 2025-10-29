<template>
  <UDashboardPanel id="admin">
    <template #body>
      <UTabs
        :items="tabItems"
        v-model="activeTab"
        :ui="{ list: 'mb-2 sm:mb-4' }"
      >
        <template #content>
          <UPageList
            v-if="activeTab === 'report'"
            class="space-y-4 sm:space-y-6"
          >
            <UPageCard
              v-for="(
                {
                  _id,
                  profile,
                  content,
                  createdAt,
                  reportTarget,
                  reportUserId,
                  reportPostId
                },
                index
              ) in reports"
              :key="_id"
              variant="subtle"
              class="hover:bg-accented/50 cursor-pointer"
              :ui="{ header: 'mb-2', body: 'w-full' }"
            >
              <template #header>
                <UUser
                  :avatar="{
                    src: `${VITE_OSS_BASE_URL}avatar/${reportUserId}`,
                    alt: profile.nickname[0]
                  }"
                  :description="profile.bio"
                  size="xl"
                  :ui="{
                    name: 'gap-2 flex text-sm text-toned items-start break-all'
                  }"
                >
                  <template #name>
                    <span>{{ profile.nickname }}</span>
                    <UBadge :label="reportTarget"></UBadge>
                  </template>
                </UUser>
              </template>
              <template #description>
                <div
                  v-if="content.text"
                  class="text-base break-words whitespace-pre-wrap"
                >
                  {{ content.text }}
                </div>
                <Carousel
                  v-if="content.images.length"
                  :class="content.text ? 'mt-2' : ''"
                  :items="content.images"
                  :active-index="0"
                ></Carousel>
                <div
                  :class="content.text && !content.images.length ? '' : 'mt-2'"
                  class="flex items-center justify-between"
                >
                  <p class="text-toned text-sm">
                    <!-- · 广东 -->
                    {{ useFormatTimeAgo(createdAt) }}
                  </p>
                </div>
              </template>
            </UPageCard>
          </UPageList>
          <UPageList v-else class="space-y-4 sm:space-y-6">
            <UPageCard
              v-for="(
                { _id, user, profile, content, createdAt }, index
              ) in feedbacks"
              :key="_id"
              variant="subtle"
              class="hover:bg-accented/50 cursor-pointer"
              :ui="{ header: 'mb-2', body: 'w-full' }"
            >
              <template #header>
                <UUser
                  :avatar="{
                    src: `${VITE_OSS_BASE_URL}avatar/${user}`,
                    alt: profile.nickname[0]
                  }"
                  :name="profile.nickname"
                  :description="profile.bio"
                  size="xl"
                  :ui="{
                    name: 'break-all'
                  }"
                >
                </UUser>
              </template>
              <template #description>
                <div
                  v-if="content.text"
                  class="text-base break-words whitespace-pre-wrap"
                >
                  {{ content.text }}
                </div>
                <Carousel
                  v-if="content.images.length"
                  :class="content.text ? 'mt-2' : ''"
                  :items="content.images"
                  :active-index="0"
                ></Carousel>
                <div
                  :class="content.text && !content.images.length ? '' : 'mt-2'"
                  class="flex items-center justify-between"
                >
                  <p class="text-toned text-sm">
                    <!-- · 广东 -->
                    {{ useFormatTimeAgo(createdAt) }}
                  </p>
                </div>
                <UButton
                  @click="onReadFeedback(user, _id, index)"
                  class="mt-2"
                  label="确认"
                ></UButton>
              </template>
            </UPageCard>
          </UPageList>
        </template>
      </UTabs>
    </template>
  </UDashboardPanel>
</template>

<script lang="ts" setup>
import { adminGetFeedbacksAPI, adminReadFeedbackAPI } from '@/apis/feedback'
import { adminGetReportsAPI } from '@/apis/report'
import { useFormatTimeAgo } from '@/hooks'
import { onMounted, ref } from 'vue'

const feedbacks = ref([])
const reports = ref([])
const { VITE_OSS_BASE_URL } = import.meta.env
const activeTab = ref<'report' | 'feedback'>('feedback')
const tabItems = [
  {
    label: '举报',
    value: 'report'
  },
  {
    label: '反馈',
    value: 'feedback'
  }
]
const toast = useToast()

const onReadFeedback = async (user, id, index) => {
  feedbacks.value.splice(index, 1)
  await adminReadFeedbackAPI(user, id)
  toast.add({ title: '操作成功', icon: 'lucide:smile' })
}

onMounted(async () => {
  feedbacks.value = (await adminGetFeedbacksAPI()).data
  reports.value = (await adminGetReportsAPI()).data
})
</script>
