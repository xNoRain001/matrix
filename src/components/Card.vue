<template>
  <div class="relative">
    <div>
      <div class="flex justify-end">
        <USwitch v-model="isMatch" :label="`${isMatch ? '匹配' : '房间'}`" />
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
            <h2 class="mt-5 leading-6 font-bold">
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
          <div v-if="offline" class="flex flex-col items-center">
            <UIcon name="lucide:wifi-off" class="text-error size-5"></UIcon>
            <div class="text-error mt-4">网络错误</div>
            <UButton
              @click="rematch"
              variant="outline"
              class="mt-4"
              label="重新匹配"
            ></UButton>
          </div>
          <div v-else class="flex flex-col items-center">
            <UIcon
              name="lucide:loader-pinwheel"
              class="size-5 animate-spin"
            ></UIcon>
            <div class="mt-4" v-if="pause">暂未匹配到对方，10 秒后重试...</div>
            <div class="mt-4" v-else>正在匹配中...</div>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
import { useScrollToTop } from '@/hooks'
import { useRoomStore } from '@/store'
import { storeToRefs } from 'pinia'
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { io } from 'socket.io-client'
import { getLatestRoom, isExitRoom } from '@/apis/latest-room'

let socket = null
let target = ''
let matchType = ''
let timer = null
let timer2 = null
const {
  meta: { tab }
} = useRoute()
const isMatch = ref(tab !== 'room')
const list = [
  {
    icon: '💬',
    title: '即时聊天',
    desc: '端到端加密，不留痕迹的安全对话',
    matchType: 'chat',
    to: `/${tab}/chat`
  },
  {
    icon: '🎙️',
    title: '语音聊天',
    desc: '高清音质，实时畅聊无延迟',
    matchType: 'audio-chat',
    to: `/${tab}/audio-chat`
  },
  {
    icon: '📁',
    title: '文件传输',
    desc: '文件高速传输，极速分享体验',
    matchType: 'file-transfer',
    to: `/${tab}/file-transfer`
  },
  {
    icon: '🎥',
    title: '视频聊天',
    desc: '开发中...',
    to: `/${tab}`
  },
  {
    icon: '🖥️',
    title: '屏幕共享',
    desc: '开发中...',
    to: `/${tab}`
  },
  {
    icon: '🎨',
    title: '多人绘画',
    desc: '开发中...',
    to: `/${tab}`
  },
  {
    icon: '🗳️',
    title: '实时投票',
    desc: '开发中...',
    to: `/${tab}`
  }
]
const pin = ref([])
const pinLength = 4
const isOpenRoomDrawer = ref(false)
const isOpenMatchDrawer = ref(false)
const router = useRouter()
const { remoteRoomInfo, firstRequestRemoteRoomInfo } =
  storeToRefs(useRoomStore())
const toast = useToast()
const pause = ref(false)
const offline = ref(false)
const leave = ref(false)

// 关闭 modal 时需要断开 socket 连接，否则会造成自己匹配到自己
const afterLeave = () => {
  leave.value = true
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
    if (!leave.value) {
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
      // 设置一个延时，否则用户刚点击匹配就立马出现匹配失败
      timer2 = setTimeout(() => {
        pause.value = true
        clearTimeout(timer2)
      }, 2000)
      timer = setTimeout(() => {
        pause.value = false
        socket.emit('match', matchType)
        clearTimeout(timer)
      }, 10000)
    } else if (type === 'suc') {
      // 可能出现匹配失败，等待再次匹配的过程中被别人给匹配到了
      clearTimeout(timer)
      const _remoteRoomInfo = remoteRoomInfo.value
      _remoteRoomInfo.roomId = message
      // _remoteRoomInfo.path = target
      // 记录房间号
      // setLatestRoom(path, message)
      _remoteRoomInfo.skipRequest = true
      router.replace({ path: target, query: { roomId: message } })
      // 不需要从匹配列表中移除，因为服务器在匹配成功时会自动将你从匹配列表中移除
    }
  })
  socket.emit('joinmatch', matchType)
  socket.emit('match', matchType)
}

const rematch = () => {
  pause.value = false
  offline.value = false
  initSocket(matchType)
}

const onClick = async (_matchType, to) => {
  // 不需要每次都请求房间信息，只在页面首次加载时请求，因为房间信息会随着操作而更新
  if (firstRequestRemoteRoomInfo.value) {
    const latestRoomInfo = (await getLatestRoom()).data
    firstRequestRemoteRoomInfo.value = false
    // 如果 latestId 有值，说明自身还没离开房间
    const { latestId } = latestRoomInfo

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

  target = to
  matchType = _matchType

  isMatch.value
    ? (isOpenMatchDrawer.value = true)
    : (isOpenRoomDrawer.value = true)

  if (isMatch.value) {
    initSocket(matchType)
  }
}

watch(pin, v => {
  if (v.length === pinLength) {
    const roomId = `${tab}-${v.join('')}`
    const _remoteRoomInfo = remoteRoomInfo.value
    _remoteRoomInfo.roomId = roomId
    // _remoteRoomInfo.path = target
    _remoteRoomInfo.skipRequest = true
    pin.value = []
    router.replace({ path: target, query: { roomId } })
  }
})

onMounted(useScrollToTop)
</script>
