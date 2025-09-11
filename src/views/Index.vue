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
      <div class="font-semibold">性别：</div>
      <UButtonGroup class="ml-2">
        <UButton
          @click="onSelectGender('male')"
          :color="isMale ? 'primary' : 'neutral'"
          :variant="isMale ? 'solid' : 'outline'"
          label="男"
          class="font-semibold"
        />
        <UButton
          @click="onSelectGender('female')"
          :color="isFemale ? 'primary' : 'neutral'"
          :variant="isFemale ? 'solid' : 'outline'"
          label="女"
          class="font-semibold"
        />
        <UButton
          @click="onSelectGender('other')"
          :color="isUndefGener ? 'primary' : 'neutral'"
          :variant="isUndefGener ? 'solid' : 'outline'"
          label="不限"
          class="font-semibold"
        />
      </UButtonGroup>
    </div>
    <div class="mt-4 flex items-center">
      <div class="font-semibold">年龄：</div>
      <UButtonGroup class="ml-2">
        <UButton
          @click="onSelectAge(18, 24)"
          :color="is18to24 ? 'primary' : 'neutral'"
          :variant="is18to24 ? 'solid' : 'outline'"
          label="18-24"
          class="font-semibold"
        />
        <UButton
          @click="onSelectAge(24, 30)"
          :color="is24to30 ? 'primary' : 'neutral'"
          :variant="is24to30 ? 'solid' : 'outline'"
          label="24-30"
          class="font-semibold"
        />
        <UButton
          @click="onSelectAge(30)"
          :color="is30Plus ? 'primary' : 'neutral'"
          :variant="is30Plus ? 'solid' : 'outline'"
          label="30+"
          class="font-semibold"
        />
        <UButton
          @click="onSelectAge(Number.MAX_SAFE_INTEGER)"
          :color="isUndefAge ? 'primary' : 'neutral'"
          :variant="isUndefAge ? 'solid' : 'outline'"
          label="不限"
          class="font-semibold"
        />
      </UButtonGroup>
    </div>
    <div class="mt-4 flex items-center">
      <div class="font-semibold">地区：</div>
      <div class="ml-2 flex gap-2">
        <USelectMenu
          :color="province ? 'primary' : 'neutral'"
          :variant="province ? 'subtle' : 'outline'"
          class="w-20 sm:w-30"
          v-model="province"
          :items="provinceOptions"
        />
        <USelectMenu
          :color="city ? 'primary' : 'neutral'"
          :variant="city ? 'subtle' : 'outline'"
          class="w-20 sm:w-30"
          v-model="city"
          :items="cityOptions"
        />
        <UButton
          @click="onSelectRegion"
          :color="isUndefRegion ? 'primary' : 'neutral'"
          :variant="isUndefRegion ? 'solid' : 'outline'"
          label="不限"
          class="font-semibold"
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
import { computed, reactive, ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useScrollToTop } from '@/hooks'
import { useMatchStore, useUserStore, useWebRTCStore } from '@/store'
import { storeToRefs } from 'pinia'
import { createReusableTemplate } from '@vueuse/core'
import { provinceCityMap } from '@/const'

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
const { hasMatchRes, offline, matching, noMatch } = storeToRefs(useMatchStore())
const { isMobile, userInfo, globalSocket } = storeToRefs(useUserStore())
const { roomId } = storeToRefs(useWebRTCStore())
const toast = useToast()
const route = useRoute()
const showCards = computed(() => route.path === '/')
const selectedGender = ref('other')
const selectedAge = reactive({
  min: Number.MAX_SAFE_INTEGER,
  max: Number.MAX_SAFE_INTEGER
})
const isMale = computed(() => selectedGender.value === 'male')
const isFemale = computed(() => selectedGender.value === 'female')
const isUndefGener = computed(() => selectedGender.value === 'other')
const is18to24 = computed(
  () => selectedAge.min === 18 && selectedAge.max === 24
)
const is24to30 = computed(
  () => selectedAge.min === 24 && selectedAge.max === 30
)
const is30Plus = computed(() => selectedAge.min === 30)
const isUndefAge = computed(() => selectedAge.min === Number.MAX_SAFE_INTEGER)
const selectedRegion = ref(null)
const isUndefRegion = computed(() => selectedRegion.value === null)
const province = ref(null)
const city = ref(null)
const sourceProvinceOptions = Object.keys(provinceCityMap)
const provinceOptions = ref(sourceProvinceOptions)
const cityOptions = ref(provinceCityMap[province.value] || [])

const onUpdateFilter = async () => {
  try {
    isOpenFilterDrawer.value = false
    toast.add({
      title: '修改成功',
      color: 'success',
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
  // selectedRegion.value = ''
  province.value = null
  city.value = null
}

const onSelectAge = (min: number, max?: number) => {
  selectedAge.min = min

  if (max) {
    selectedAge.max = max
  }
}

const onSelectGender = gender => {
  selectedGender.value = gender
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
  offline.value = false
  hasMatchRes.value = false
  startMatch()
}

const onMatch = (_matchType, to) => {
  if (to === '/') {
    return
  }

  if (_matchType === 'voice-chat' && roomId.value) {
    return toast.add({
      title: '匹配失败，当前正在语音中',
      color: 'error'
    })
  }

  matchType = _matchType
  startMatch()
}

watch(province, v => {
  cityOptions.value = provinceCityMap[v]
  // 切换省份时清空市区
  city.value = null // 赋值为 '' 会引起样式问题
  selectedRegion.value = v
})

watch(city, v => {
  // 切换省份时清空市区，此时值是空字符串
  if (v) {
    selectedRegion.value = `${province.value} - ${v}`
  }
})

onMounted(useScrollToTop)
</script>
