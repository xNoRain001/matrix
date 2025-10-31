<template>
  <UDashboardPanel id="feedback">
    <template #body>
      <UPageList class="space-y-4 sm:space-y-6">
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
  </UDashboardPanel>
</template>

<script lang="ts" setup>
import { adminGetFeedbacksAPI, adminReadFeedbackAPI } from '@/apis/admin'
import { useFormatTimeAgo } from '@/hooks'
import { onMounted, ref } from 'vue'

const feedbacks = ref([])
const { VITE_OSS_BASE_URL } = import.meta.env
const toast = useToast()

const onReadFeedback = async (user, id, index) => {
  try {
    await adminReadFeedbackAPI(user, id)
    feedbacks.value.splice(index, 1)
    toast.add({ title: '操作成功', icon: 'lucide:smile' })
  } catch {
    toast.add({ title: '操作失败', color: 'error', icon: 'lucide:annoyed' })
  }
}

onMounted(async () => {
  feedbacks.value = (await adminGetFeedbacksAPI()).data
})
</script>
