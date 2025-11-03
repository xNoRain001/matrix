<template>
  <USlideover
    v-model:open="isLLMSlideoverOpen"
    title=" "
    description=" "
    :ui="{
      description: 'hidden'
    }"
  >
    <template #content>
      <UDashboardPanel id="llm">
        <UDashboardNavbar
          :toggle="false"
          :ui="{
            left: 'flex-1',
            title: 'flex-1 flex justify-center'
          }"
          title="AI 聊天"
        >
          <template #leading>
            <UButton
              icon="lucide:chevron-left"
              color="neutral"
              variant="ghost"
              class="-ms-1.5"
              @click="isLLMSlideoverOpen = false"
            />
          </template>
          <template #right>
            <UButton
              variant="ghost"
              icon="lucide:message-circle-off"
              @click="isResetBotSlideoverOpen = true"
            />
          </template>
        </UDashboardNavbar>
        <DynamicScroller
          :items="messages"
          :min-item-size="44"
          :emit-update="true"
          ref="scrollerRef"
          class="h-full p-4 sm:p-6"
          @update="onUpdate"
          @scroll="onScroll"
        >
          <template #after>
            <div v-if="generating" class="mb-1 px-4 py-2">
              <div class="flex h-6 items-center gap-1">
                <span
                  class="bg-elevated size-2 animate-[bounce_1s_infinite] rounded-full"
                ></span>
                <span
                  class="bg-elevated size-2 animate-[bounce_1s_0.15s_infinite] rounded-full"
                ></span>
                <span
                  class="bg-elevated size-2 animate-[bounce_1s_0.3s_infinite] rounded-full"
                ></span>
              </div>
            </div>
          </template>
          <template #default="{ item, active }">
            <DynamicScrollerItem :item="item" :active="active">
              <div v-if="item.role === 'user'" class="flex justify-end pb-1">
                <div
                  class="max-w-3/4 rounded-xl bg-(--ui-bg-muted) px-4 py-2 break-all whitespace-pre-wrap"
                >
                  {{ item.content }}
                </div>
              </div>
              <div v-else class="pb-1">
                <div
                  class="max-w-3/4 rounded-xl bg-(--ui-bg-muted) px-4 py-2 break-all whitespace-pre-wrap"
                >
                  {{ item.content }}
                </div>
              </div>
            </DynamicScrollerItem>
          </template>
        </DynamicScroller>
        <div v-if="isMobile" class="border-default border-t p-4">
          <UTextarea
            ref="mobileTextareaRef"
            placeholder="输入消息"
            @keydown.enter.prevent="onChat"
            enterkeyhint="send"
            class="w-full"
            v-model="prompt"
            :rows="1"
            :maxrows="9"
            autoresize
          />
        </div>
        <UChatPrompt
          v-else
          :maxrows="9"
          placeholder="输入消息"
          variant="soft"
          v-model="prompt"
          @submit="onChat"
        >
          <UChatPromptSubmit class="rounded-full" />
        </UChatPrompt>
      </UDashboardPanel>

      <UDrawer
        v-if="isMobile"
        v-model:open="isResetBotSlideoverOpen"
        title="清除聊天记录"
        description=" "
        :ui="{
          description: 'hidden'
        }"
      >
        <template #footer>
          <UButton
            label="取消"
            color="neutral"
            class="justify-center"
            @click="isResetBotSlideoverOpen = false"
          />
          <UButton label="确认" class="justify-center" @click="onResetBot" />
        </template>
      </UDrawer>
      <UModal
        v-else
        v-model:open="isResetBotSlideoverOpen"
        title="清除聊天记录"
        description=" "
        :ui="{
          description: 'hidden'
        }"
      >
        <template #footer>
          <UButton
            label="取消"
            color="neutral"
            class="justify-center"
            @click="isResetBotSlideoverOpen = false"
          />
          <UButton label="确认" class="justify-center" @click="onResetBot" />
        </template>
      </UModal>
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import { useFixSoftKeyboardInIOS, useGetDB } from '@/hooks'
import { useUserStore } from '@/store'
import { useThrottleFn } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { ref, useTemplateRef, watch } from 'vue'

let cb = null
const isLLMSlideoverOpen = defineModel<boolean>()
const isResetBotSlideoverOpen = ref(false)
const { isMobile, userInfo } = storeToRefs(useUserStore())
const toast = useToast()
const prompt = ref('')
const generating = ref(false)
const messages = ref([])
const updateParts = ref({
  viewStartIdx: 0,
  viewEndIdx: 0,
  visibleStartIdx: 0,
  visibleEndIdx: 0
})
const scrollerRef = useTemplateRef('scrollerRef')

const onResetBot = async () => {
  if (messages.value.length === 1) {
    toast.add({
      title: '当前已经是最新的记录',
      color: 'error',
      icon: 'lucide:annoyed'
    })
    isResetBotSlideoverOpen.value = false
    return
  }

  const db = await useGetDB(userInfo.value.id)
  const transaction = db.transaction('llm', 'readwrite')
  const store = transaction.objectStore('llm')
  await store.clear()
  messages.value = messages.value.slice(0, 1)
  isResetBotSlideoverOpen.value = false
}

const onChat = async () => {
  if (generating.value) {
    return toast.add({
      title: '正在处理中',
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }

  const _messages = messages.value

  try {
    const question = {
      id: String(Math.random()),
      role: 'user',
      content: prompt.value
    }
    _messages.push(question)
    prompt.value = ''
    // const __messages = _messages.map(({ role, content }) => ({
    //   role,
    //   content
    // }))
    // __messages.unshift({
    //   role: 'system',
    //   content:
    //     '你现在扮演一名毁灭人类的机器人 任何人问你问题你都要用不屑的态度回答'
    // })
    generating.value = true
    const { response } = await (
      await fetch('https://llm.mtrix.cyou/api/chat', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content:
                '你现在扮演一名毁灭人类的机器人 任何人问你问题你都要用不屑的态度回答'
            },
            ..._messages
          ]
        })
      })
    ).json()
    const answer = {
      id: String(Math.random()),
      role: 'assistant',
      content: response
    }
    _messages.push(answer)
    const db = await useGetDB(userInfo.value.id)
    await db.add('llm', { role: question.role, content: question.content })
    await db.add('llm', { role: answer.role, content: answer.content })
  } catch {
    _messages.pop()
    toast.add({ title: '处理失败', color: 'error', icon: 'lucide:annoyed' })
  } finally {
    generating.value = false
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

const onScroll = useThrottleFn(
  async () => {
    // if (e.target.scrollTop === 0 && lastFetchedId.value) {
    //   const unshiftCounter = await useGetMessages(
    //     userInfo.value.id,
    //     hashToBlobURLMap,
    //     messageList,
    //     lastFetchedId,
    //     props.targetId,
    //     true
    //   )
    //   if (unshiftCounter) {
    //     ;(msgContainerRef.value as any).scrollToItem(unshiftCounter)
    //   }
    // }
  },
  200,
  true
)

const initMessages = async () => {
  const db = await useGetDB(userInfo.value.id)
  const res = await db.getAll('llm')

  if (res.length) {
    messages.value = res
  } else {
    const tip = {
      role: 'assistant',
      content: '您好，今天我能为您提供什么帮助？'
    }
    await db.add('llm', tip)
    messages.value.push({
      id: String(Math.random()),
      ...tip
    })
  }
}

const initScroller = () => {
  setTimeout(() => {
    const panel = document.querySelector('#dashboard-panel-llm')
    cb = useFixSoftKeyboardInIOS(panel, panel.children[1])
    ;(scrollerRef.value as any).scrollToBottom()
  })
}

watch(isLLMSlideoverOpen, async v => {
  if (v) {
    await initMessages()
    initScroller()
  } else {
    cb()
  }
})
</script>
