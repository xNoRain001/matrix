<template>
  <div v-show="showCards" class="relative">
    <div class="flex items-center justify-end gap-4">
      <UButton
        :disabled="!isMatch"
        @click="isOpenFilterDrawer = true"
        label="筛选"
        icon="lucide:filter"
        color="neutral"
        variant="ghost"
        :ui="{ leadingIcon: 'text-primary', label: 'font-semibold' }"
      ></UButton>
      <USwitch
        v-model="isMatch"
        :ui="{ label: 'font-semibold' }"
        :label="`${isMatch ? '匹配' : '房间'}`"
      />
    </div>
    <div class="mt-4 grid grid-cols-2 gap-4">
      <div
        v-for="({ icon, title, desc, matchType, to }, index) in list"
        :key="index"
      >
        <div
          @click="onClick(matchType, to)"
          class="bg-elevated hover:bg-accented h-full cursor-pointer rounded-xl p-6"
        >
          <div
            class="bg-default flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
          >
            {{ icon }}
          </div>
          <h2 class="mt-5 leading-6 font-semibold">
            {{ title }}
          </h2>
          <p class="mt-2 text-sm leading-6">
            {{ desc }}
          </p>
        </div>
      </div>
    </div>
  </div>

  <UModal
    v-if="!isMatch"
    v-model:open="isOpenRoomDrawer"
    fullscreen
    title="房间"
    description=" "
  >
    <template #body>
      <div class="flex h-full items-center justify-center">
        <UPinInput :length="pinLength" autofocus v-model="pin"></UPinInput>
      </div>
    </template>
  </UModal>

  <UModal
    v-else
    v-model:open="isOpenMatchDrawer"
    fullscreen
    title="匹配"
    description=" "
    v-on:after:leave="afterLeave"
  >
    <template #body>
      <div class="flex h-full items-center justify-center">
        <UButton
          v-if="offline"
          icon="lucide:wifi-off"
          @click="rematch"
          color="error"
          label="重新匹配"
        ></UButton>
        <UButton v-else-if="pause" label="继续匹配" @click="rematch"></UButton>
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
      <div class="ml-2 space-x-2">
        <USelectMenu
          :color="province ? 'primary' : 'neutral'"
          :variant="province ? 'subtle' : 'outline'"
          class="w-20"
          v-model="province"
          :items="provinceOptions"
        />
        <USelectMenu
          :color="city ? 'primary' : 'neutral'"
          :variant="city ? 'subtle' : 'outline'"
          class="w-20"
          v-model="city"
          :items="cityOptions"
        />
      </div>
      <UButtonGroup class="ml-2">
        <UButton
          @click="onSelectRegion"
          :color="isUndefRegion ? 'primary' : 'neutral'"
          :variant="isUndefRegion ? 'solid' : 'outline'"
          label="不限"
          class="font-semibold"
        />
      </UButtonGroup>
    </div>
    <UButton @click="onUpdateFilter" class="mt-4" label="确定修改"></UButton>
  </DefineFilterBodyTemplate>
  <UModal
    v-if="isDesktop"
    title="筛选"
    description=" "
    v-model:open="isOpenFilterDrawer"
  >
    <template #body>
      <ReuseFilterBodyTemplate></ReuseFilterBodyTemplate>
    </template>
  </UModal>
  <UDrawer
    v-else
    title="筛选"
    description=" "
    v-model:open="isOpenFilterDrawer"
  >
    <template #body>
      <ReuseFilterBodyTemplate></ReuseFilterBodyTemplate>
    </template>
  </UDrawer>

  <router-view v-if="!showCards"></router-view>
</template>

<script lang="ts" setup>
import { computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useScrollToTop } from '@/hooks'
import { useRoomStore } from '@/store'
import { storeToRefs } from 'pinia'
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { io } from 'socket.io-client'
import { getLatestRoom, isExitRoom } from '@/apis/latest-room'
import { createReusableTemplate, useMediaQuery } from '@vueuse/core'
import { provinceCityMap } from '@/const'

let socket = null
let target = ''
let matchType = ''
let timer = null
const [DefineFilterBodyTemplate, ReuseFilterBodyTemplate] =
  createReusableTemplate()
const isDesktop = useMediaQuery('(min-width: 768px)')
const list = [
  {
    icon: '💬',
    title: '即时聊天',
    desc: '端到端加密，不留痕迹的安全对话',
    matchType: 'chat',
    to: `/hall/chat`
  },
  {
    icon: '🎙️',
    title: '语音聊天',
    desc: '高清音质，实时畅聊无延迟',
    matchType: 'audio-chat',
    to: `/hall/audio-chat`
  },
  {
    icon: '📁',
    title: '文件传输',
    desc: '文件高速传输，极速分享体验',
    matchType: 'file-transfer',
    to: `/hall/file-transfer`
  },
  {
    icon: '🎥',
    title: '视频聊天',
    desc: '开发中...',
    to: `/hall`
  },
  {
    icon: '🖥️',
    title: '屏幕共享',
    desc: '开发中...',
    to: `/hall`
  },
  {
    icon: '🎨',
    title: '多人绘画',
    desc: '开发中...',
    to: `/hall`
  },
  {
    icon: '🗳️',
    title: '实时投票',
    desc: '开发中...',
    to: `/hall`
  }
]
const pin = ref([])
const pinLength = 4
const isOpenRoomDrawer = ref(false)
const isOpenMatchDrawer = ref(false)
const isOpenFilterDrawer = ref(false)
const router = useRouter()
const { isMatch, remoteRoomInfo, firstRequestRemoteRoomInfo } =
  storeToRefs(useRoomStore())
const toast = useToast()
const pause = ref(false)
const noMatch = ref(false)
const offline = ref(false)
const leave = ref(false)
const route = useRoute()
const showCards = computed(() => route.path === '/hall')
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
const selectedRegion = ref('')
const isUndefRegion = computed(() => selectedRegion.value === '')
const province = ref('')
const city = ref('')
const sourceProvinceOptions = Object.keys(provinceCityMap)
const provinceOptions = ref(sourceProvinceOptions)
const cityOptions = ref(provinceCityMap[province.value] || [])

const onUpdateFilter = () => {
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
  selectedRegion.value = ''
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

// 关闭 modal 时需要断开 socket 连接，否则会造成自己匹配到自己
const afterLeave = () => {
  leave.value = true
  pause.value = false
  offline.value = false
  noMatch.value = false
  socket && socket.disconnect()
}

const initSocket = matchType => {
  // @ts-ignore
  socket = io.connect(import.meta.env.VITE_API_BASE_URL, {
    reconnectionAttempts: 5
  })

  socket.on('connect', () => {})
  // 如果匹配中突然断网，需要很久才会触发这个回调，之后会去重试，重试时如果失败触发
  // connect_error 回调
  socket.on('disconnect', () => {
    // 匹配成功时会跳转路由，关闭 modal，断开 socket 连接，只通过 !leave.value 判断
    // 连接服务器失败会造成匹配成功时出现连接服务器失败提示
    if (!leave.value && !pause.value) {
      offline.value = true
      toast.add({
        title: '连接服务器失败...',
        color: 'error'
      })
    }
  })
  // 如果没网络的状态进入匹配，触发这个回调，之后的每次重试都会触发
  socket.on('connect_error', () => {
    offline.value = true
    toast.add({
      title: '连接服务器失败...',
      color: 'error'
    })
  })

  socket.on('matched', data => {
    const { type, message } = data

    if (type === 'fail') {
      noMatch.value = true

      // 不需要重新发送匹配，因为仍在匹配列表中
      timer = setTimeout(() => {
        noMatch.value = false
        clearTimeout(timer)
      }, 2000)
    } else if (type === 'suc') {
      // 可能出现未匹配到对方，等待再次匹配的过程中被别人给匹配到了
      clearTimeout(timer)
      const _remoteRoomInfo = remoteRoomInfo.value
      _remoteRoomInfo.roomId = message
      _remoteRoomInfo.skipRequest = true
      pause.value = true
      // 手动断开连接，虽然服务器中已经标记该 socket 已匹配并从匹配列表中移除了
      socket.disconnect()
      router.replace({ path: target, query: { roomId: message } })
      // 不需要从匹配列表中移除，因为服务器在匹配成功时会自动将你从匹配列表中移除
    }
  })
  socket.emit('joinmatch', matchType)
  socket.emit('match', matchType)
}

const rematch = () => {
  noMatch.value = false
  offline.value = false
  pause.value = false
  initSocket(matchType)
}

const onClick = async (_matchType, to) => {
  target = to
  matchType = _matchType
  const _isMatch = isMatch.value

  // 先打开 modal，否则会造成页面卡顿的样子
  if (_isMatch) {
    isOpenMatchDrawer.value = true
  } else {
    isOpenRoomDrawer.value = true
  }

  // 不需要每次都请求房间信息，只在页面首次加载时请求，因为房间信息会随着操作而更新
  if (firstRequestRemoteRoomInfo.value) {
    const latestRoomInfo = (await getLatestRoom()).data
    firstRequestRemoteRoomInfo.value = false
    // 如果之前从没参与过匹配， latestRoomInfo 值为 null，
    const latestId = latestRoomInfo?.latestId

    // 如果 latestId 有值，说明自身还没离开房间
    if (latestId) {
      remoteRoomInfo.value = latestRoomInfo
      // 判断对方是否离开房间
      const isExit = (await isExitRoom(latestId)).data
      const _remoteRoomInfo = remoteRoomInfo.value
      _remoteRoomInfo.inRoom = latestId && !isExit
      router.replace({
        path: _remoteRoomInfo.path,
        query: { roomId: _remoteRoomInfo.roomId }
      })
      return
    }
  }

  if (_isMatch) {
    initSocket(matchType)
  }
}

watch(pin, v => {
  const s = v.join('')

  if (s.length === pinLength) {
    const roomId = `${matchType}-${s}`
    const _remoteRoomInfo = remoteRoomInfo.value
    _remoteRoomInfo.roomId = roomId
    _remoteRoomInfo.skipRequest = true
    // TODO: 修复返回时最后一位数字依然存在
    pin.value.length = 0
    router.replace({ path: target, query: { roomId } })
  }
})

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
