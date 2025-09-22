<template>
  <UDashboardPanel id="home">
    <template #header>
      <IndexHeader></IndexHeader>
    </template>

    <template #body>
      <div class="flex items-center gap-4">
        <UButton
          @click="isOpenFilterDrawer = true"
          icon="lucide:filter"
          color="neutral"
          variant="ghost"
          :ui="{ leadingIcon: 'text-primary', label: 'font-semibold' }"
        ></UButton>
      </div>
      <!-- class="from-primary/10 to-default bg-gradient-to-tl from-5%" -->
      <UPageCard
        v-for="({ icon, title, desc, matchType, to }, index) in list"
        :key="index"
        @click="onMatch(matchType, to)"
        :title="title"
        :description="desc"
        :icon="icon"
        orientation="horizontal"
        variant="subtle"
        class="cursor-pointer"
      >
        <!-- <img src="/images/tailwindcss-v4.svg" alt="Tailwind CSS" class="w-full" /> -->
      </UPageCard>
      <router-view v-if="!showCards"></router-view>
    </template>

    <template v-if="isMobile" #footer>
      <div class="h-16"></div>
    </template>
  </UDashboardPanel>

  <!-- 匹配 -->
  <UModal
    v-model:open="matching"
    fullscreen
    title="匹配"
    description=" "
    @after:leave="afterLeave"
  >
    <template #body>
      <div class="flex h-full items-center justify-center">
        <UButton
          v-if="offline"
          @click="rematch"
          color="error"
          icon="lucide:wifi-off"
          label="重新匹配"
        ></UButton>
        <div v-else class="flex flex-col items-center text-sm">
          <UIcon
            name="lucide:loader-pinwheel"
            class="size-5 animate-spin"
          ></UIcon>
          <div class="mt-4" v-if="noMatch">暂未匹配到对方，请耐心等待...</div>
          <div class="mt-4" v-else>正在匹配中...</div>
        </div>
      </div>
    </template>
  </UModal>
  <!-- 需要提前获取到 icon，否则断网时，icon 加载不出来 -->
  <UIcon hidden name="lucide:wifi-off"></UIcon>

  <DefineFilterBodyTemplate>
    <div class="flex items-center">
      <div>性别：</div>
      <URadioGroup
        orientation="horizontal"
        variant="table"
        indicator="hidden"
        v-model="filter.gender"
        :items="genderItems"
        :ui="{
          item: 'bg-elevated/50 py-2 has-data-[state=checked]:bg-primary'
        }"
      >
        <template #label="{ item: { label, value } }">
          <div
            :class="
              value === filter.gender ? 'text-inverted' : 'text-highlighted'
            "
          >
            {{ label }}
          </div>
        </template>
      </URadioGroup>
    </div>
    <div class="mt-4 flex items-center">
      <div>年龄：</div>
      <URadioGroup
        orientation="horizontal"
        variant="table"
        indicator="hidden"
        v-model="filter.age"
        :items="ageItems"
        :ui="{
          item: 'bg-elevated/50 py-2 has-data-[state=checked]:bg-primary'
        }"
      >
        <template #label="{ item: { label, value } }">
          <div
            :class="value === filter.age ? 'text-inverted' : 'text-highlighted'"
          >
            {{ label }}
          </div>
        </template>
      </URadioGroup>
    </div>
    <div class="mt-4 flex items-center">
      <div>地区：</div>
      <div class="flex flex-1 gap-2">
        <USelect
          :color="province ? 'primary' : 'neutral'"
          :variant="province ? 'subtle' : 'outline'"
          class="flex-1"
          :class="province ? 'bg-elevated/50' : ''"
          v-model="province"
          :items="provinceOptions"
          size="lg"
        />
        <USelect
          :color="city ? 'primary' : 'neutral'"
          :variant="city ? 'subtle' : 'outline'"
          class="flex-1"
          :class="city ? 'bg-elevated/50' : ''"
          v-model="city"
          :items="cityOptions"
        />
        <UButton
          @click="onSelectRegion"
          :color="isUndefRegion ? 'primary' : 'neutral'"
          :variant="isUndefRegion ? 'solid' : 'outline'"
          label="不限"
        />
      </div>
    </div>
    <UButton
      loading-auto
      @click="onUpdateFilter"
      class="mt-4"
      label="确定修改"
    ></UButton>
  </DefineFilterBodyTemplate>
  <UDrawer
    v-if="isMobile"
    title="筛选"
    description=" "
    v-model:open="isOpenFilterDrawer"
  >
    <template #body>
      <ReuseFilterBodyTemplate></ReuseFilterBodyTemplate>
    </template>
  </UDrawer>
  <UModal v-else title="筛选" description=" " v-model:open="isOpenFilterDrawer">
    <template #body>
      <ReuseFilterBodyTemplate></ReuseFilterBodyTemplate>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useMatchStore, useUserStore, useWebRTCStore } from '@/store'
import { storeToRefs } from 'pinia'
import { createReusableTemplate } from '@vueuse/core'
import { provinceCityMap } from '@/const'
import { useIsDeviceOpen } from '@/hooks'

let matchType = ''
const [DefineFilterBodyTemplate, ReuseFilterBodyTemplate] =
  createReusableTemplate()
const list = [
  {
    icon: 'lucide:message-circle',
    title: '即时聊天',
    desc: '端到端加密，不留痕迹的安全对话',
    matchType: 'chat',
    to: '/chat'
  },
  {
    icon: 'lucide:phone',
    title: '语音聊天',
    desc: '高清音质，实时畅聊无延迟',
    matchType: 'voice-chat',
    to: '/voice-chat'
  },
  {
    icon: 'lucide:video',
    title: '视频聊天',
    desc: '开发中...',
    to: '/'
  }
]
const isOpenFilterDrawer = ref(false)
const { hasMatchRes, offline, matching, noMatch, filter } =
  storeToRefs(useMatchStore())
const { isMobile, userInfo, globalSocket } = storeToRefs(useUserStore())
const { roomId } = storeToRefs(useWebRTCStore())
const toast = useToast()
const route = useRoute()
const showCards = computed(() => route.path === '/')
const isUndefRegion = computed(() => filter.value.region === '')
const [_province, _city] = isUndefRegion.value
  ? [null, null]
  : filter.value.region.split(' - ')
const province = ref(_province)
const city = ref(_city)
const sourceProvinceOptions = Object.keys(provinceCityMap)
const provinceOptions = ref(sourceProvinceOptions)
const cityOptions = ref(provinceCityMap[province.value] || [])
const genderItems = ref([
  {
    label: '男',
    value: 'male'
  },
  {
    label: '女',
    value: 'female'
  },
  {
    label: '不限',
    value: 'other'
  }
])
const ageItems = ref([
  {
    label: '18-24',
    value: '18-24'
  },
  {
    label: '24-30',
    value: '24-30'
  },
  {
    label: '30+',
    value: '30+'
  },
  {
    label: '不限',
    value: 'other'
  }
])

const onUpdateFilter = async () => {
  try {
    isOpenFilterDrawer.value = false

    if (province.value && !city.value) {
      province.value = null
    }

    localStorage.setItem(
      `filter-${userInfo.value.id}`,
      JSON.stringify(filter.value)
    )
    toast.add({
      title: '修改成功',
      icon: 'lucide:smile'
    })
  } catch (error) {
    toast.add({
      title: error.message,
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}

const onSelectRegion = () => {
  filter.value.region = ''
  province.value = null
  city.value = null
}

const afterLeave = () => {
  // 匹配成功时服务器中会将双方从匹配池中清除，这里不需要再次处理
  if (!hasMatchRes.value) {
    globalSocket.value.emit('exit-match', matchType)
  }

  hasMatchRes.value = false
  offline.value = false
  noMatch.value = false
}

const startMatch = () => {
  matching.value = true
  const t = { ...userInfo.value }
  delete t.tokenVersion
  const socket = globalSocket.value
  socket.emit('join-match', matchType, t)
  socket.emit('start-match', matchType)
}

// 当匹配时断网会出现重新匹配按钮，点击执行这个函数
const rematch = () => {
  noMatch.value = false
  offline.value = false
  hasMatchRes.value = false
  startMatch()
}

const onMatch = async (_matchType, to) => {
  if (to === '/') {
    return
  }

  if (_matchType === 'voice-chat') {
    if (roomId.value) {
      return toast.add({
        title: '匹配失败，当前正在语音中',
        color: 'error',
        icon: 'lucide:annoyed'
      })
    }

    if (!(await useIsDeviceOpen(toast, 'microphone', '麦克风'))) {
      return
    }
  }

  matchType = _matchType
  startMatch()
}

watch(province, v => {
  if (v) {
    cityOptions.value = provinceCityMap[v]
    // 切换省份时清空市区
    city.value = null
  }
})

watch(city, v => {
  // 切换省份时清空市区，此时值是空字符串
  if (v) {
    filter.value.region = `${province.value} - ${v}`
  }
})
</script>
