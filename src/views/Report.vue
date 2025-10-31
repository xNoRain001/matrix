<template>
  <UDashboardPanel id="admin">
    <template #body>
      <UPageList class="space-y-4 sm:space-y-6">
        <UPageCard
          v-for="(
            { _id, user, profile, content, reportTarget, reportUserId, post },
            index
          ) in reports"
          :key="_id"
          variant="subtle"
          class="hover:bg-accented/50 cursor-pointer"
          :ui="{ header: 'mb-2', body: 'w-full' }"
        >
          <template #description>
            <template v-if="reportTarget === 'post'">
              <div
                v-if="post.content.text"
                class="text-base break-words whitespace-pre-wrap"
              >
                {{ post.content.text }}
              </div>
              <Carousel
                v-if="post.content.images.length"
                :class="post.content.text ? 'mt-2' : ''"
                :items="post.content.images"
                :active-index="0"
              ></Carousel>
            </template>
            <template v-else-if="reportTarget === 'avatar'">
              <img
                class="max-h-80 max-w-80 rounded-lg"
                :src="`${VITE_OSS_BASE_URL}avatar/${reportUserId}`"
              />
            </template>
            <template v-else-if="reportTarget === 'spaceBg'">
              <img
                class="max-h-80 max-w-80 rounded-lg"
                :src="`${VITE_OSS_BASE_URL}space-bg/${reportUserId}`"
              />
            </template>
            <template v-else-if="reportTarget === 'nickname'">
              <span>{{ profile.nickname }}</span>
            </template>
            <template v-else-if="reportTarget === 'bio'">
              <span>{{ profile.bio }}</span>
            </template>
            <template v-else-if="reportTarget === 'tag'">
              <div class="flex flex-wrap gap-2">
                <UBadge v-for="tag in profile.tags" :label="tag"></UBadge>
              </div>
            </template>

            <USeparator
              label="举报人发言"
              :ui="{ border: 'border-elevated' }"
            />
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
            <div class="mt-2">
              <UButton
                label="违规"
                @click="
                  onHandleReport(
                    index,
                    _id,
                    user,
                    reportTarget,
                    reportUserId,
                    post?._id
                  )
                "
              ></UButton>
              <UButton
                class="ml-2"
                label="正常"
                @click="onReadReport(_id, index)"
              ></UButton>
            </div>
          </template>
        </UPageCard>
      </UPageList>
    </template>
  </UDashboardPanel>
</template>

<script lang="ts" setup>
import {
  adminGetReportsAPI,
  adminReadReportAPI,
  adminResetProfileAPI
} from '@/apis/admin'
import { onMounted, ref } from 'vue'

const reports = ref([])
const { VITE_OSS_BASE_URL } = import.meta.env
const toast = useToast()

const onHandleReport = async (
  index,
  _id,
  user,
  reportTarget,
  reportUserId,
  postId
) => {
  try {
    await adminResetProfileAPI(_id, user, reportTarget, reportUserId, postId)
    reports.value.splice(index, 1)
    toast.add({ title: '操作成功', icon: 'lucide:smile' })
  } catch {
    toast.add({ title: '操作失败', color: 'error', icon: 'lucide:annoyed' })
  }
}

const onReadReport = async (id, index) => {
  try {
    await adminReadReportAPI(id)
    reports.value.splice(index, 1)
    toast.add({ title: '操作成功', icon: 'lucide:smile' })
  } catch {
    toast.add({ title: '操作失败', color: 'error', icon: 'lucide:annoyed' })
  }
}

onMounted(async () => {
  reports.value = (await adminGetReportsAPI()).data
})
</script>
