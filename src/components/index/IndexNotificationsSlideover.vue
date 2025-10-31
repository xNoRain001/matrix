<template>
  <USlideover
    v-model:open="isNotificationsSlideoverOpen"
    title="通知"
    description=" "
    :ui="{
      description: 'hidden'
    }"
  >
    <template #body>
      <div
        v-for="({ _id, createdAt, content, type }, index) in homeNotifications"
        :key="_id"
        class="bg-elevated/50 cursor-pointer rounded-lg p-4 not-last:mb-2 sm:p-6"
      >
        <UUser
          size="xl"
          :ui="{
            wrapper: 'flex-1 min-w-0',
            description: 'flex justify-between items-center gap-2'
          }"
        >
          <template #description>
            <span class="flex-1 truncate">{{ content }}</span>
            <time
              >{{ useFormatTimeAgo(createdAt)
              }}{{
                type === 'feedback'
                  ? '已阅读反馈'
                  : type === 'reporter'
                    ? '已处理举报对象'
                    : ''
              }}</time
            >
            <UBadge
              label="删除"
              color="error"
              @click="onDelete(index)"
            ></UBadge>
          </template>
        </UUser>
      </div>
      <UBlogPost
        class="not-last:mb-2"
        variant="soft"
        image="https://nuxt.com/assets/blog/nuxt-icon/cover.png"
        date="2000-01-01 14:23"
        title="Lorem ipsum dolor sit amet."
        description="Lorem
        ipsum dolor sit amet consectetur adipisicing elit. Voluptas iste dolore
        at expedita sint delectus nisi pariatur blanditiis. Sint, eaque saepe
        harum doloribus iste eos nesciunt hic veritatis provident quos!"
      >
      </UBlogPost>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { useFormatTimeAgo } from '@/hooks'
import { useNotificationsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'

const isNotificationsSlideoverOpen = defineModel<boolean>()
const { userInfo } = storeToRefs(useUserStore())
const { homeNotifications } = storeToRefs(useNotificationsStore())

const onDelete = index => {
  homeNotifications.value.splice(index, 1)
  localStorage.setItem(
    `homeNotifications-${userInfo.value.id}`,
    JSON.stringify(homeNotifications.value)
  )
}
</script>
