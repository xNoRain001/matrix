<template>
  <UDashboardPanel
    id="report"
    :class="isMobile ? 'pb-16' : ''"
    :ui="{ body: 'p-0 sm:p-0' }"
  >
    <template #body>
      <div>
        <UPageCard
          v-for="(
            { _id, user, profile, reportTarget, post, comment, product }, index
          ) in reports"
          :key="_id"
          variant="subtle"
          class="cursor-pointer"
          :ui="{ header: 'mb-2', body: 'w-full' }"
        >
          <template #description>
            <template v-if="reportTarget === 'post'">
              <template v-if="post">
                <div
                  v-if="post.content.text"
                  class="text-base break-all whitespace-pre-wrap"
                >
                  {{ post.content.text }}
                </div>
                <Carousel
                  v-if="post.content.images.length"
                  :set-loading="true"
                  :class="post.content.text ? 'mt-2' : ''"
                  :items="post.content.images"
                  :active-index="0"
                />
              </template>
              <div v-else>内容已被用户删除</div>
            </template>
            <template v-else-if="reportTarget === 'comment'">
              <template v-if="comment">
                <div
                  v-if="comment.content.text"
                  class="text-base break-all whitespace-pre-wrap"
                >
                  {{ comment.content.text }}
                </div>
                <Carousel
                  v-if="comment.content.images.length"
                  :set-loading="true"
                  :class="comment.content.text ? 'mt-2' : ''"
                  :items="comment.content.images"
                  :active-index="0"
                />
              </template>
              <div v-else>内容已被用户删除</div>
            </template>
            <template v-if="reportTarget === 'product'">
              <template v-if="product">
                <div
                  v-if="product.content.text"
                  class="text-base break-all whitespace-pre-wrap"
                >
                  {{ product.content.text }}
                </div>
                <Carousel
                  v-if="product.content.images.length"
                  :set-loading="true"
                  :class="product.content.text ? 'mt-2' : ''"
                  :items="product.content.images"
                  :active-index="0"
                />
              </template>
              <div v-else>内容已被用户删除</div>
            </template>
            <template v-else-if="reportTarget === 'avatar'">
              <img
                loading="lazy"
                class="max-h-80 max-w-80 rounded-lg"
                :src="`${VITE_OSS_BASE_URL}avatar/${user}`"
              />
            </template>
            <template v-else-if="reportTarget === 'spaceBg'">
              <img
                loading="lazy"
                class="max-h-80 max-w-80 rounded-lg"
                :src="`${VITE_OSS_BASE_URL}space-bg/${user}`"
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

            <!-- <USeparator
              label="举报人发言"
              :ui="{ border: 'border-elevated' }"
            />
            <div
              v-if="content.text"
              class="text-base break-all whitespace-pre-wrap"
            >
              {{ content.text }}
            </div>
            <Carousel
              v-if="content.images.length"
              :set-loading="true"
              :class="content.text ? 'mt-2' : ''"
              :items="content.images"
              :active-index="0"
            ></Carousel> -->
            <div class="mt-2 flex gap-2">
              <UButton
                v-if="
                  !(
                    (reportTarget === 'post' && !post) ||
                    (reportTarget === 'comment' && !comment) ||
                    (reportTarget === 'product' && !product)
                  )
                "
                label="违规"
                @click="
                  onHandleReport(
                    index,
                    _id,
                    reportTarget,
                    user,
                    post?._id,
                    comment?._id,
                    product?._id
                  )
                "
              />
              <UButton label="正常" @click="onReadReport(_id, index)" />
            </div>
          </template>
        </UPageCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script lang="ts" setup>
import {
  adminGetReportsAPI,
  adminReadReportAPI,
  adminResetProfileAPI
} from '@/apis/admin'
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'

const { isMobile } = storeToRefs(useUserStore())
const reports = ref([])
const { VITE_OSS_BASE_URL } = import.meta.env
const toast = useToast()

const onHandleReport = async (
  index,
  _id,
  reportTarget,
  reportedUserId,
  postId,
  commentId,
  productId
) => {
  try {
    await adminResetProfileAPI(
      _id,
      reportTarget,
      reportedUserId,
      postId,
      commentId,
      productId
    )
    reports.value.splice(index, 1)
    toast.add({ title: '操作成功', icon: 'lucide:smile' })
  } catch (error) {
    toast.add({ title: error.message, color: 'error', icon: 'lucide:annoyed' })
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
