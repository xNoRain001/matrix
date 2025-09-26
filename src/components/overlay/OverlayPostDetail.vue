<template>
  <USlideover
    :dismissible="!isMobile && isMatch ? false : true"
    :overlay="!isMobile && isMatch ? false : true"
    :side="!isMobile && isMatch ? 'left' : 'right'"
    :class="!isMobile && isMatch ? 'max-w-2/5' : ''"
    title="详情"
    description=" "
  >
    <template #body>
      <UPageCard
        v-for="(detail, index) in postDetail"
        :key="index"
        variant="naked"
        class="not-last:pb-4"
        :ui="{ body: 'w-full' }"
      >
        <template #body>
          <UUser
            :avatar="detail.avatar"
            size="xl"
            :ui="{
              root: 'items-start',
              wrapper: 'flex-1' // 让 description 宽度撑满
            }"
          >
            <template #name>
              {{ detail.profile.nickname
              }}<UBadge label="作者" class="ml-2" size="sm"></UBadge>
            </template>
            <template #description>
              <div>{{ detail.comment }}</div>
              <div class="flex items-center justify-between">
                <p>
                  3 天前 · 广东
                  <span class="text-highlighted ml-2">回复</span>
                </p>
                <div>
                  <UButton
                    variant="ghost"
                    icon="lucide:heart"
                    label="133"
                  ></UButton>
                  <UButton variant="ghost" icon="lucide:heart-crack"></UButton>
                </div>
              </div>
              <UCollapsible v-model:open="detail.open">
                <template #content>
                  <UPageCard
                    v-for="i in 2"
                    :key="i"
                    class="not-last:pb-2 first:pt-2"
                    variant="naked"
                    :ui="{ body: 'w-full' }"
                  >
                    <template #body>
                      <UUser
                        :name="detail.profile.nickname"
                        :avatar="detail.avatar"
                        size="xl"
                        :ui="{
                          root: 'items-start',
                          wrapper: 'flex-1',
                          avatar: 'size-5'
                        }"
                      >
                        <template #name>
                          {{ detail.profile.nickname
                          }}<UBadge
                            label="作者"
                            class="ml-2"
                            size="sm"
                          ></UBadge>
                          <!-- <UIcon
                            name="lucide:chevrons-right"
                            class="text-toned inline"
                          ></UIcon>
                          AC -->
                        </template>
                        <template #description>
                          <div>Lorem ipsum dolor sit.</div>
                          <div class="flex items-center justify-between">
                            <p>
                              3 天前 · 广东
                              <span class="text-highlighted ml-2">回复</span>
                            </p>
                            <div>
                              <UButton
                                variant="ghost"
                                icon="lucide:heart"
                                label="1"
                              ></UButton>
                              <UButton
                                variant="ghost"
                                icon="lucide:heart-crack"
                              ></UButton>
                            </div>
                          </div>
                        </template>
                      </UUser>
                    </template>
                  </UPageCard>
                </template>
              </UCollapsible>
              <UButton
                @click="detail.open = true"
                :label="`—— 展开${detail.open ? '更多' : ' 55 条回复'}`"
                color="neutral"
                variant="ghost"
                trailing-icon="i-lucide-chevron-down"
              />
              <UButton
                v-if="detail.open"
                @click="detail.open = false"
                label="收起"
                color="neutral"
                variant="ghost"
                trailing-icon="i-lucide-chevron-up"
              />
            </template>
          </UUser>
        </template>
      </UPageCard>
    </template>
    <template #footer>
      <UInput
        placeholder="善语结缘，温暖常伴..."
        class="relative w-full"
        autoresize
        @click="isMobile ? commentOverlay.open() : null"
        v-model="comment"
      >
        <template #trailing v-if="!isMobile">
          <UButton variant="ghost" icon="lucide:image"></UButton>
          <UButton variant="ghost" icon="lucide:smile"></UButton>
          <UButton
            v-if="comment.length"
            variant="ghost"
            icon="lucide:send"
          ></UButton>
        </template>
      </UInput>
      <div v-if="isMobile" class="flex">
        <UButton
          variant="ghost"
          label="123"
          icon="lucide:message-circle-more"
        ></UButton>
        <UButton variant="ghost" label="123" icon="lucide:heart"></UButton>
      </div>
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import OverlayComment from './OverlayComment.vue'

defineProps<{ isMatch: boolean }>()
const { isMobile } = storeToRefs(useUserStore())
const comment = ref('')
const overlay = useOverlay()
const commentOverlay = overlay.create(OverlayComment)
const postDetail = ref([
  {
    profile: {
      nickname: 'Benjamin Canac'
    },
    comment: '在我的后园，可以看见墙外有两株树，一株是枣树，还有一株也是枣树。',
    avatar: {
      src: 'https://github.com/benjamincanac.png',
      alt: 'benjamincanac'
    },
    open: false
  },
  {
    profile: {
      nickname: 'Sylvain Marroufin'
    },
    comment: '在我的后园，可以看见墙外有两株树，一株是枣树，还有一株也是枣树。',
    avatar: {
      src: 'https://github.com/smarroufin.png',
      alt: 'smarroufin'
    },
    open: false
  }
])
</script>
