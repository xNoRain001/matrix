<template>
  <!-- <div class="-mt-4 flex justify-center pb-4">
    <div class="relative w-full max-w-(--room-width)"> -->
  <div
    v-for="(
      { separator, type, timestamp, content, sent, showProgress }, index
    ) in messageList"
    :key="index"
  >
    <div v-if="type === 'label'" class="mt-4 text-center text-sm">
      {{ formatTimestamp(timestamp) }}
    </div>
    <div v-else-if="type === 'message'">
      <div
        :class="separator ? 'mt-4' : 'mt-1'"
        v-if="sent"
        class="flex items-center justify-end gap-3"
      >
        <div
          class="max-w-3/4 rounded-xl bg-(--ui-bg-muted) px-4 py-2 break-words whitespace-pre-wrap"
        >
          {{ content[0] }}
        </div>
        <UAvatar
          v-if="separator"
          :text="userInfo.nickname[0] || ''"
          size="md"
        />
        <div v-else class="h-8 w-8"></div>
      </div>
      <div
        v-else
        :class="separator ? 'mt-4' : 'mt-1'"
        class="flex items-center gap-3"
      >
        <UAvatar
          v-if="separator"
          :text="otherInfo?.nickname[0] || ''"
          size="md"
        />
        <div v-else class="w-8"></div>
        <div
          class="max-w-3/4 rounded-xl bg-(--ui-bg-muted) px-4 py-2 break-words whitespace-pre-wrap"
        >
          {{ content[0] }}
        </div>
      </div>
    </div>
    <div v-else-if="type === 'image'">
      <div
        :class="separator ? 'mt-4' : 'mt-1'"
        v-if="sent"
        class="flex items-center justify-end gap-3"
      >
        <div class="max-w-3/4 rounded-xl bg-(--ui-bg-muted) px-4 py-2">
          <img :src="content[0]" />
        </div>
        <UAvatar
          v-if="separator"
          :text="userInfo.nickname[0] || ''"
          size="md"
        />
        <div v-else class="h-8 w-8"></div>
      </div>
      <div
        v-else
        :class="separator ? 'mt-4' : 'mt-1'"
        class="flex items-center gap-3"
      >
        <UAvatar
          v-if="separator"
          :text="otherInfo?.nickname[0] || ''"
          size="md"
        />
        <div v-else class="w-8"></div>
        <div class="max-w-3/4 rounded-xl bg-(--ui-bg-muted) px-4 py-2">
          <img :src="content[0]" />
        </div>
      </div>
    </div>
    <div v-else-if="type === 'video'">
      <div
        :class="separator ? 'mt-4' : 'mt-1'"
        v-if="sent"
        class="flex items-center justify-end gap-3"
      >
        <div class="max-w-3/4 rounded-xl bg-(--ui-bg-muted) px-4 py-2">
          <video :src="content[0]" controls></video>
        </div>
        <UAvatar
          v-if="separator"
          :text="userInfo.nickname[0] || ''"
          size="md"
        />
        <div v-else class="h-8 w-8"></div>
      </div>
      <div
        v-else
        :class="separator ? 'mt-4' : 'mt-1'"
        class="flex items-center gap-3"
      >
        <UAvatar
          v-if="separator"
          :text="otherInfo?.nickname[0] || ''"
          size="md"
        />
        <div v-else class="w-8"></div>
        <div class="max-w-3/4 rounded-xl bg-(--ui-bg-muted) px-4 py-2">
          <video :src="content[0]" controls></video>
        </div>
      </div>
    </div>
    <div v-else-if="type === 'file'">
      <div
        :class="separator ? 'mt-4' : 'mt-1'"
        v-if="sent"
        class="flex items-center justify-end gap-3"
      >
        <div class="max-w-3/4 rounded-xl bg-(--ui-bg-muted) px-4 py-2">
          <div class="flex items-center justify-between gap-1.5">
            <div class="grow">
              <div>
                {{ content[1] }}
              </div>
              <div class="text-muted text-sm">
                {{ (content[2] / 1024 / 1024).toFixed(2) }} MB
              </div>
              <UProgress
                v-if="
                  showProgress && sendFiles[0].fileStatus.status === sending
                "
                :ui="{ status: 'justify-start' }"
                status
                v-model="sendFiles[0].fileStatus.progress"
                :max="100"
              />
            </div>
            <!-- 
                      在线传输时，传输完成显示成功按钮，重新加载页面时，
                      由于 showProgress 为 false，会直接显示成功按钮 
                    -->
            <div v-if="!showProgress" class="p-1.5">
              <UIcon
                name="lucide:circle-check-big"
                class="text-primary size-5"
              ></UIcon>
            </div>
          </div>
        </div>
        <UAvatar
          v-if="separator"
          :text="userInfo.nickname[0] || ''"
          size="md"
        />
        <div v-else class="h-8 w-8"></div>
      </div>
      <div
        v-else
        :class="separator ? 'mt-4' : 'mt-1'"
        class="flex items-center gap-3"
      >
        <UAvatar
          v-if="separator"
          :text="otherInfo?.nickname[0] || ''"
          size="md"
        />
        <div v-else class="w-8"></div>
        <div class="max-w-3/4 rounded-xl bg-(--ui-bg-muted) px-4 py-2">
          <div class="flex items-center justify-between gap-1.5">
            <div class="grow">
              <div>
                {{ content[1] }}
              </div>
              <div class="text-muted text-sm">
                {{ (content[2] / 1024 / 1024).toFixed(2) }} MB
              </div>
              <UProgress
                v-if="
                  showProgress && sendFiles[0].fileStatus.status === sending
                "
                :ui="{ status: 'justify-start' }"
                status
                v-model="sendFiles[0].fileStatus.progress"
                :max="100"
              />
            </div>
            <UButton
              icon="lucide:cloud-download"
              variant="ghost"
              @click="onDownload(content[0], content[1])"
            />
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="type === 'audio'">
      <div
        :class="separator ? 'mt-4' : 'mt-1'"
        v-if="sent"
        class="flex items-center justify-end gap-3"
      >
        <div class="max-w-3/4 rounded-xl bg-(--ui-bg-muted) px-4 py-2">
          <audio :src="content[0]" controls></audio>
        </div>
        <UAvatar
          v-if="separator"
          :text="userInfo.nickname[0] || ''"
          size="md"
        />
        <div v-else class="h-8 w-8"></div>
      </div>
      <div
        v-else
        :class="separator ? 'mt-4' : 'mt-1'"
        class="flex items-center gap-3"
      >
        <UAvatar
          v-if="separator"
          :text="otherInfo?.nickname[0] || ''"
          size="md"
        />
        <div v-else class="w-8"></div>
        <div class="max-w-3/4 rounded-xl bg-(--ui-bg-muted) px-4 py-2">
          <audio :src="content[0]" controls></audio>
        </div>
      </div>
    </div>
  </div>
  <div
    v-if="msgStamp.value"
    class="absolute -bottom-5 text-xs"
    :class="msgStamp.sent ? 'right-11' : 'left-11'"
  >
    {{ msgStamp.value }}
  </div>
  <!-- </div>
  </div> -->
</template>

<script lang="ts" setup>
import { useExportFile } from '@/hooks'
import { ref } from 'vue'
import { sending } from '@/const'
import type { extendedFiles, receivedFiles, message } from '@/types'
import { useRoomStore, useUserInfoStore } from '@/store'
import { storeToRefs } from 'pinia'

defineProps<{
  messageList: message[]
  msgStamp: {
    sent: boolean
    value: string
  }
}>()
const { otherInfo } = storeToRefs(useRoomStore())
const { userInfo } = storeToRefs(useUserInfoStore())
const receivedFiles: receivedFiles = ref([])
const sendFiles = ref<extendedFiles>([])
const dateTimeFormatOptions: Intl.DateTimeFormatOptions = {
  // year: 'numeric',
  // month: 'long',
  // day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  weekday: 'long'
}

const onDownload = (url, filename) => {
  fetch(url)
    .then(res => res.blob())
    .then(blob => useExportFile(filename, blob))
}

const formatTimestamp = (timestamp: number) => {
  // TODO: 更久远的记录显示日期甚至年份
  return new Date(timestamp).toLocaleString('zh-CN', dateTimeFormatOptions)
}
</script>
