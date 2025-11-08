<template>
  <div class="bg-default border-t-default fixed bottom-0 h-16 w-full border-t">
    <UTabs
      ref="tabsRef"
      v-model="activeTab"
      variant="link"
      :ui="{
        list: 'flex justify-evenly border-none',
        indicator: 'hidden',
        trigger: 'flex flex-col text-xs'
      }"
      :content="false"
      :items="footerNavs"
    >
      <template #trailing="{ item: { value } }">
        <UBadge
          v-if="value === '/messages' && unreadMsgCounter"
          class="absolute top-0 right-0"
          :label="unreadMsgCounter"
          size="sm"
        />
        <UBadge
          v-if="value === '/contacts' && unreadContactNotificationCount"
          class="absolute top-0 right-0"
          :label="unreadContactNotificationCount"
          size="sm"
        />
        <UBadge
          v-if="value === '/' && unreadHomeNotificationCount"
          class="absolute top-0 right-0"
          :label="unreadHomeNotificationCount"
          size="sm"
        />
      </template>
    </UTabs>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, useTemplateRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { storeToRefs } from 'pinia'
import {
  useFooterStore,
  useNotificationsStore,
  useRecentContactsStore
} from '@/store'

const { unreadMsgCounter } = storeToRefs(useRecentContactsStore())
const { unreadHomeNotificationCount, unreadContactNotificationCount } =
  storeToRefs(useNotificationsStore())
const tabsRef = useTemplateRef('tabsRef')
const { footerNavs } = storeToRefs(useFooterStore())
const route = useRoute()
const router = useRouter()
const activeTab = computed({
  get() {
    return route.path
  },
  set(tab) {
    router.push(tab)
  }
})

const initAutoScrollBtn = () => {
  const list = tabsRef.value.triggersRef as any

  for (let i = 0, l = list.length; i < l; i++) {
    const { value, $el } = list[i]

    if (value === '/playground') {
      $el.addEventListener('click', e => {
        if (e.currentTarget.children[1].textContent === '顶部') {
          document
            .querySelector(`#dashboard-panel-playground`)
            .children[1].scrollTo({ top: 0, behavior: 'smooth' })
        }
      })
    } else if (value === '/profile') {
      $el.addEventListener('click', e => {
        if (e.currentTarget.children[1].textContent === '顶部') {
          document
            .querySelector(`#post-scroller`)
            .scrollTo({ top: 0, behavior: 'smooth' })
        }
      })
    }
  }
}

// 滚动后没有返回到顶部的情况下切换到其他页面，需要恢复 label 和 icon
watch(activeTab, (_, oldValue) => {
  if (oldValue === '/playground') {
    footerNavs.value[1].label = '广场'
    footerNavs.value[1].icon = 'lucide:rose'
  } else if (oldValue === '/profile') {
    footerNavs.value[4].label = '我的'
    footerNavs.value[4].icon = 'lucide:user-round-cog'
  }
})

onMounted(() => {
  initAutoScrollBtn()
})
</script>
