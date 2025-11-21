<template>
  <Suspense>
    <UApp
      v-if="userInfo"
      :locale="zh_cn"
      :toaster="{ position: 'top-center', progress: false }"
    >
      <UDashboardGroup unit="rem" storage="local">
        <UDashboardSidebar
          id="default"
          collapsible
          resizable
          class="bg-elevated/25"
          :ui="{ footer: 'lg:border-t lg:border-default' }"
        >
          <template #header>
            <svg
              class="size-8"
              style="filter: drop-shadow(rgba(0, 122, 204, 0.3) 0px 8px 24px)"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 576 512"
            >
              <path
                fill="var(--ui-primary)"
                d="M320 192l17.1 0c22.1 38.3 63.5 64 110.9 64c11 0 21.8-1.4 32-4l0 4 0 32 0 192c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-140.8L280 448l56 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-144 0c-53 0-96-43-96-96l0-223.5c0-16.1-12-29.8-28-31.8l-7.9-1c-17.5-2.2-30-18.2-27.8-35.7s18.2-30 35.7-27.8l7.9 1c48 6 84.1 46.8 84.1 95.3l0 85.3c34.4-51.7 93.2-85.8 160-85.8zm160 26.5s0 0 0 0c-10 3.5-20.8 5.5-32 5.5c-28.4 0-54-12.4-71.6-32c0 0 0 0 0 0c-3.7-4.1-7-8.5-9.9-13.2C357.3 164 352 146.6 352 128c0 0 0 0 0 0l0-96 0-20 0-1.3C352 4.8 356.7 .1 362.6 0l.2 0c3.3 0 6.4 1.6 8.4 4.2c0 0 0 0 0 .1L384 21.3l27.2 36.3L416 64l64 0 4.8-6.4L512 21.3 524.8 4.3c0 0 0 0 0-.1c2-2.6 5.1-4.2 8.4-4.2l.2 0C539.3 .1 544 4.8 544 10.7l0 1.3 0 20 0 96c0 17.3-4.6 33.6-12.6 47.6c-11.3 19.8-29.6 35.2-51.4 42.9zM432 128a16 16 0 1 0 -32 0 16 16 0 1 0 32 0zm48 16a16 16 0 1 0 0-32 16 16 0 1 0 0 32z"
              />
            </svg>
          </template>

          <template #default="{ collapsed }">
            <UDashboardSearchButton
              :collapsed="collapsed"
              class="ring-default bg-transparent"
            />

            <UNavigationMenu
              :collapsed="collapsed"
              :items="navs[0]"
              orientation="vertical"
              tooltip
              popover
            >
              <template #home-trailing>
                <UBadge
                  v-if="unreadHomeNotificationCount"
                  :label="unreadHomeNotificationCount"
                  size="sm"
              /></template>
              <template #messages-trailing>
                <UBadge
                  v-if="unreadMsgCounter"
                  :label="unreadMsgCounter"
                  size="sm"
              /></template>
              <template #contacts-trailing>
                <UBadge
                  v-if="unreadContactNotificationCount"
                  :label="unreadContactNotificationCount"
                  size="sm"
              /></template>
            </UNavigationMenu>

            <UNavigationMenu
              :collapsed="collapsed"
              :items="navs[1]"
              orientation="vertical"
              tooltip
              class="mt-auto"
            />
          </template>

          <template #footer="{ collapsed }">
            <IndexUserMenu :collapsed="collapsed" />
          </template>
        </UDashboardSidebar>
        <UDashboardSearch :groups="groups" />
        <RouterView />
        <!-- 移动端底部导航栏 -->
        <IndexFooter v-if="isMobile" />
      </UDashboardGroup>

      <!-- 需要提前获取到断网重连时 icon，否则断网时，icon 加载不出来 -->
      <UIcon hidden name="i-lucide-loader" />
      <!-- 语音通话浮动按钮 -->
      <UButton
        v-if="roomId"
        @mousedown="onMousedown"
        @mouseup="onMouseup"
        @touchstart="onTouchstart"
        @touchmove.prevent="onTouchmove"
        @touchend="onSaveFloatingBtnPosition"
        @click="!moving && talkOverlay.open()"
        icon="lucide:phone-call"
        size="xl"
        class="absolute cursor-pointer"
        :style="{
          top: `${floatingBtnY}px`,
          left: `${floatingBtnX}px`
        }"
      />
      <!-- 音频 -->
      <audio hidden ref="localAudioRef" muted></audio>
      <audio hidden ref="remoteAudioRef" autoplay></audio>
      <audio hidden ref="beepAudioRef"></audio>
      <IndexSkyBg v-if="config.theme.starsBg" />
    </UApp>

    <!-- 注册登录和重置密码等内容 -->
    <UApp v-else :toaster="{ position: 'top-center', progress: false }">
      <RouterView />
      <IndexSkyBg v-if="config.theme.starsBg" />
    </UApp>
  </Suspense>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import {
  useMatchStore,
  useMessagesStore,
  useNotificationsStore,
  useRecentContactsStore,
  useUserStore,
  useWebRTCStore
} from './store'
import { computed, onBeforeMount, onMounted, ref } from 'vue'
import type { NavigationMenuItem } from '@nuxt/ui'
import OverlayLogout from './components/overlay/OverlayLogout.vue'
import { io } from 'socket.io-client'
import {
  useInitLastMsg,
  useAddMediaStreamToPC,
  useBindMediaStream,
  useCloseMediaStreamTracks,
  useGetDB,
  useGetTargetIdByRoomId,
  useGetUserMedia,
  usePauseMediaStreamTracks,
  useResumeMediaStreamTracks,
  useAddMessageRecordToView,
  useAddMessageRecordToDB,
  useUpdateLastMsgToDB,
  useRefreshContacts,
  useInitLabelAndSeparator,
  useSendMsg,
  useUpdateLastMsgToView,
  useAddPropsForMessageRecord,
  useInitIndexedDBData,
  useIsDeviceOpen,
  useURLToBlob
} from './hooks'
import { useRouter } from 'vue-router'
import { voiceChatInviteToastExpireTime } from './const'
import OverlayOffline from './components/overlay/OverlayOffline.vue'
import { useThrottleFn } from '@vueuse/core'
import OverlayPublisher from './components/overlay/OverlayPublisher.vue'
import type { message } from './types'
import OverlayTalk from './components/overlay/OverlayTalk.vue'
import OverlayHelpAndSupport from './components/overlay/OverlayHelpAndSupport.vue'
import OverlayAbout from './components/overlay/OverlayAbout.vue'
import { zh_cn } from '@nuxt/ui/locale'
import { getGeoInfoAPI } from './apis/profile'

let voiceChatInviteToastId = null
let matchTimer = null
let ignoreOffer = false
let polite = true
let makingOffer = false
let beepTimer = null
let playBeep = true
let firstConnectionSuccess = false
let reconnectionAttempts = 0
let isOfflineModalOpen = false
let floatingBtnStartX = 0
let floatingBtnStartY = 0
let moving = false
let floatingBtnMaxX = 0
let floatingBtnMaxY = 0
const maxReconnectionAttempts = 1
const toast = useToast()
const overlay = useOverlay()
const logoutOverlay = overlay.create(OverlayLogout)
const publisherOverlay = overlay.create(OverlayPublisher)
const offlineOverlay = overlay.create(OverlayOffline)
const { isMobile, globalSocket, globalPC, userInfo, config, onlineCount } =
  storeToRefs(useUserStore())
const {
  leaveRoomTimer,
  rtcConnected,
  isVoiceChatMatch,
  roomId,
  localAudioRef,
  remoteAudioRef,
  localMediaStream,
  isMicOpen,
  isSpeakerOpen,
  webRTCTargetId,
  webRTCTargetProfile
} = storeToRefs(useWebRTCStore())
const {
  unreadMsgCounter,
  lastMsgMap,
  lastMsgList,
  contactList,
  contactProfileMap,
  hashToBlobURLMap,
  indexMap,
  isReceivingOfflineMsgs,
  isFirstGetContactsOnlineStatus,
  isFirstGetChatsOnlineStatus,
  activeTargetIds
} = storeToRefs(useRecentContactsStore())
const { messageRecordMap } = storeToRefs(useMessagesStore())
const {
  contactNotifications,
  homeNotifications,
  unreadContactNotificationCount,
  unreadHomeNotificationCount
} = storeToRefs(useNotificationsStore())
const { matchRes, hasMatchRes, offline, matching, noMatch } =
  storeToRefs(useMatchStore())
const navs = [
  [
    {
      label: '大厅',
      icon: 'lucide:house',
      to: '/',
      slot: 'home'
    },
    {
      label: '广场',
      icon: 'lucide:aperture',
      to: '/playground'
    },
    {
      label: '好友',
      icon: 'lucide:users-round',
      to: '/contacts',
      slot: 'contacts'
    },
    {
      label: '消息',
      icon: 'lucide:message-circle',
      to: '/messages',
      slot: 'messages'
    },
    {
      label: '我的',
      icon: 'lucide:user-round-cog',
      to: '/profile/space',
      defaultOpen: true,
      type: 'trigger',
      children: [
        {
          label: '个人资料',
          to: '/profile/user-info',
          exact: true
        },
        {
          label: '情绪切片',
          to: '/profile/space'
        },
        {
          label: '通知管理',
          to: '/profile/notifications'
        },
        {
          label: '主题管理',
          to: '/profile/theme'
        },
        {
          label: '数据管理',
          to: '/profile/data-manager'
        },
        // {
        //   label: '修改密码',
        //   to: '/profile/update-password'
        // },
        // {
        //   label: '注销账号',
        //   to: '/profile/logoff'
        // },
        {
          label: '退出登录',
          onSelect: () => logoutOverlay.open()
        }
      ]
    }
  ],
  [
    {
      label: '反馈',
      icon: 'lucide:message-circle',
      onSelect: () => publisherOverlay.open({ action: 'feedback' })
    },
    {
      label: '帮助和支持',
      icon: 'lucide:circle-question-mark',
      onSelect: () => helpAndSupportOverlay.open()
    },
    {
      label: '关于我们',
      icon: 'lucide:info',
      onSelect: () => abouttOverlay.open()
    }
    // {
    //   label: '只有神知道的世界',
    //   icon: 'lucide:leaf',
    //   onSelect: () => router.replace('/ys')
    // }
  ]
] satisfies NavigationMenuItem[][]
const groups = computed(() => [
  {
    id: 'links',
    label: '访问',
    items: navs.flat()
  }
])
const router = useRouter()
const constraints = {
  video: false,
  audio: {
    echoCancellation: true, // 回声消除
    noiseSuppression: true, // 降噪
    autoGainControl: true // 自动增益
  }
}
const rtcConfiguration: RTCConfiguration = {
  // 直连时，数据不经过 STUN/TURN
  // 只有在无法直连时，数据才会经过 TURN 服务器
  // 服务器测试可用性： https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/
  iceServers: [
    // 免费 STUN 服务器
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:81.68.131.234:3478' },
    // TURN 服务器配置
    {
      urls: 'turn:81.68.131.234:3478',
      username: 'test',
      credential: 'test123'
    }
  ],
  iceTransportPolicy: 'all', // 可选: 'all' | 'relay'
  bundlePolicy: 'max-bundle', // 可选: 'balanced' | 'max-compat' | 'max-bundle'
  rtcpMuxPolicy: 'require', // 可选: 'require'
  iceCandidatePoolSize: 0 // 可选: 0~N，通常为0
}
const beepAudioRef = ref(null)
const floatingBtnX = ref(Number(localStorage.getItem('floatingBtnX') || 40))
const floatingBtnY = ref(Number(localStorage.getItem('floatingBtnY') || 40))
const talkOverlay = overlay.create(OverlayTalk)
const helpAndSupportOverlay = overlay.create(OverlayHelpAndSupport)
const abouttOverlay = overlay.create(OverlayAbout)
const { VITE_ENV, VITE_VERSION, VITE_OSS_BASE_URL } = import.meta.env

const initFloatingBtnPosition = (currentTarget, clientX, clientY) => {
  const { left, top, width, height } = currentTarget.getBoundingClientRect()
  const { clientWidth, clientHeight } = document.documentElement

  floatingBtnStartX = clientX - left
  floatingBtnStartY = clientY - top
  floatingBtnMaxX = clientWidth - width
  floatingBtnMaxY = clientHeight - height
}

const updateFloatingBtnPosition = (clientX, clientY) => {
  floatingBtnX.value = Math.min(
    Math.max(clientX - floatingBtnStartX, 0),
    floatingBtnMaxX
  )
  floatingBtnY.value = Math.min(
    Math.max(clientY - floatingBtnStartY, 0),
    floatingBtnMaxY
  )
}

const onMousedown = e => {
  moving = false
  const { clientX, clientY, currentTarget } = e
  initFloatingBtnPosition(currentTarget, clientX, clientY)
  document.addEventListener('mousemove', onMousemove)
}

const onMousemove = useThrottleFn(
  e => {
    moving = true
    const { clientX, clientY } = e
    updateFloatingBtnPosition(clientX, clientY)
  },
  50,
  true,
  false
)

const onMouseup = () => {
  document.removeEventListener('mousemove', onMousemove)
  onSaveFloatingBtnPosition()
}

const onSaveFloatingBtnPosition = () => {
  localStorage.setItem('floatingBtnX', String(floatingBtnX.value))
  localStorage.setItem('floatingBtnY', String(floatingBtnY.value))
}

const onTouchstart = e => {
  const {
    currentTarget,
    touches: [{ clientX, clientY }]
  } = e
  initFloatingBtnPosition(currentTarget, clientX, clientY)
}

const onTouchmove = useThrottleFn(
  e => {
    const { clientX, clientY } = e.touches[0]
    updateFloatingBtnPosition(clientX, clientY)
  },
  50,
  true,
  false
)

const onReconnect = emit => {
  offlineOverlay.patch({
    reconnecting: true
  })

  // 重试次数耗尽后，必须重新创建 socket
  const socket = createSocket(emit)
  initSocket(socket)
}

const createPeerConnection = (
  _roomId: string,
  onTrack: (e: RTCTrackEvent) => void
) => {
  const pc = (globalPC.value = new RTCPeerConnection(rtcConfiguration))
  const socket = globalSocket.value

  pc.onicecandidate = ({ candidate }) => {
    if (candidate?.candidate?.includes('typ srflx')) {
      console.log('经过 stun 服务器')
    } else if (candidate?.candidate?.includes('typ relay')) {
      console.log('经过 turn 服务器')
    }

    socket.emit('web-rtc', _roomId, { candidate })
  }

  // 当 PeerConnection 对象收到远端音视频流时，会触发 ontrack 事件
  pc.ontrack = onTrack

  pc.oniceconnectionstatechange = () => {
    const { iceConnectionState } = pc

    if (iceConnectionState === 'failed') {
      console.log('rtc failed...')
      pc.restartIce()
    } else if (iceConnectionState === 'disconnected') {
      // 其中一方关闭网页或者断网后，过几秒对方会触发这里的逻辑
      console.log('rtc disconnected...')
      onBye(_roomId)
    } else if (iceConnectionState === 'connected') {
      console.log('rct connected...')
      rtcConnected.value = true
    }
  }

  return pc
}

const startRTC = async roomId => {
  const pc = globalPC.value
  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)
  globalSocket.value.emit('web-rtc', roomId, { description: offer })
}

const onAddContact = async notification => {
  toast.add({
    title: notification.profile.nickname,
    description: '请求添加你为好友',
    avatar: {
      src: `${VITE_OSS_BASE_URL}avatar/${notification.id}`,
      alt: notification.profile.nickname[0]
    }
  })
  const _contactNotifications = contactNotifications.value
  const { id } = userInfo.value
  _contactNotifications.unshift(notification)
  unreadContactNotificationCount.value++
  localStorage.setItem(
    `contactNotifications-${id}`,
    JSON.stringify(_contactNotifications)
  )
  localStorage.setItem(
    `unreadContactNotificationCount-${id}`,
    String(unreadContactNotificationCount.value)
  )
}

const onAgreeContact = (notification, contact) => {
  const _contactNotifications = contactNotifications.value
  _contactNotifications.unshift(notification)
  unreadContactNotificationCount.value++
  const { id } = userInfo.value
  localStorage.setItem(
    `contactNotifications-${id}`,
    JSON.stringify(_contactNotifications)
  )
  localStorage.setItem(
    `unreadContactNotificationCount-${id}`,
    String(unreadContactNotificationCount.value)
  )
  const _contactList = contactList.value
  const _contactProfileMap = contactProfileMap.value
  const { id: contactId } = contact
  _contactList.unshift(contactId)
  _contactProfileMap[contactId] = contact
  localStorage.setItem(`contactList-${id}`, JSON.stringify(_contactList))
  localStorage.setItem(
    `contactProfileMap-${id}`,
    JSON.stringify(_contactProfileMap)
  )
}

const onRefuseContact = notification => {
  const _contactNotifications = contactNotifications.value
  const { id } = userInfo.value
  _contactNotifications.unshift(notification)
  unreadContactNotificationCount.value++
  localStorage.setItem(
    `contactNotifications-${id}`,
    JSON.stringify(_contactNotifications)
  )
  localStorage.setItem(
    `unreadContactNotificationCount-${id}`,
    String(unreadContactNotificationCount.value)
  )
}

const onDeleteContact = (notification, targetId) => {
  const _contactNotifications = contactNotifications.value
  _contactNotifications.unshift(notification)
  unreadContactNotificationCount.value++
  const { id } = userInfo.value
  localStorage.setItem(
    `contactNotifications-${id}`,
    JSON.stringify(_contactNotifications)
  )
  localStorage.setItem(
    `unreadContactNotificationCount-${id}`,
    String(unreadContactNotificationCount.value)
  )

  const _contactList = contactList.value
  const _contactProfileMap = contactProfileMap.value
  const index = _contactList.findIndex(id => id === targetId)

  if (index >= 0) {
    _contactList.splice(index, 1)
    delete _contactProfileMap[targetId]
    localStorage.setItem(`contactList-${id}`, JSON.stringify(_contactList))
    localStorage.setItem(
      `contactProfileMap-${id}`,
      JSON.stringify(_contactProfileMap)
    )
  }
}

const onRefreshContacts = data => {
  useRefreshContacts(userInfo.value.id, data, contactList, contactProfileMap)
}

const onTrack = ({ track, streams }) => {
  // 轨道一旦开始接收数据包，就会取消静音
  track.onunmute = () => {
    const remoteAudio = remoteAudioRef.value
    const remoteMediaStream = remoteAudio.srcObject

    // 清空以前绑定的远程媒体流
    if (remoteMediaStream) {
      useCloseMediaStreamTracks(remoteMediaStream as any)
    }

    useBindMediaStream(remoteAudio, streams[0])
  }
}

const initLocalMediaStream = async () => {
  try {
    const _localMediaStream = (localMediaStream.value =
      await useGetUserMedia(constraints))
    // 最先加入房间的人会比后加入的更晚完成 pc 初始化
    // 在没初始化之前用户可能点击关闭麦克风，初始化完成时需要更新媒体流状态
    // 也可能是第二次创建 pc，需要重新绑定媒体流到 pc，此时的新本地流中
    // 的麦克风和扬声器的状态需要和旧的本地流状态统一
    isMicOpen.value
      ? useResumeMediaStreamTracks(localMediaStream.value)
      : usePauseMediaStreamTracks(localMediaStream.value)
    remoteAudioRef.value.muted = isSpeakerOpen.value ? false : true
    // 绑定本地流
    useBindMediaStream(localAudioRef.value, _localMediaStream)
    useAddMediaStreamToPC(globalPC.value, _localMediaStream)
  } catch (err) {
    console.error(err)
    console.log('未获取到用户设备')
    isMicOpen.value = false
  }
}

const onConnect = emit => {
  if (!firstConnectionSuccess) {
    firstConnectionSuccess = true

    // 在模态框内重连成功
    if (isOfflineModalOpen) {
      offlineOverlay.patch({
        reconnecting: false
      })
      isOfflineModalOpen = false
      emit && emit('close', false)
      // 不需要在这里拉取离线信息，因为模态框内重连成功一定是执行了 onReconnect，内部
      // 会拉取离线信息
    }
  } else {
    // 未出现模态框的情况下重连成功，比如移动端将页面置于后台，但不关闭浏览器，过一段
    // 时间返回后重连成功时会触发这里，只需要拉取离线信息
    globalSocket.value.emit('ready')
  }

  reconnectionAttempts = 0
}

const onJoined = async (_roomId, _polite) => {
  roomId.value = _roomId

  if (!talkOverlay.isOpen) {
    talkOverlay.open()
  } else if (_polite) {
    // 处理匹配语音通话时其中一方刷新页面后，能够恢复通话
    // 先进来的一方，规定时间内无法等到对方加入，判断为对方离开了房间
    leaveRoomTimer.value = setTimeout(() => {
      globalSocket.value.emit('leave', roomId.value)
      roomId.value = ''
      clearTimeout(leaveRoomTimer.value)
      matchRes.value = null
      const { id } = userInfo.value
      localStorage.removeItem(`matchRes-${id}`)
      toast.add({
        title: '对方已离开房间',
        color: 'error',
        icon: 'lucide:annoyed'
      })
      router.replace('/')
    }, 5000)
  }

  polite = _polite

  // 同意的一方需要更新 roomId
  if (!_polite) {
    createPeerConnection(_roomId, onTrack)
    await initLocalMediaStream()
    globalSocket.value.emit('otherjoin', _roomId)
  }
}

const onOtherJoin = async roomId => {
  clearTimeout(leaveRoomTimer.value)
  polite = true
  const pc = globalPC.value
  pc && pc.close()
  createPeerConnection(roomId, onTrack)
  // 确保在创建 offer 前添加至少一个 track 或 stream
  await initLocalMediaStream()

  try {
    makingOffer = true
    await startRTC(roomId)
  } catch (err) {
    console.error(err)
  } finally {
    makingOffer = false
  }
}

const onWebRTC = async (roomId, { description, candidate }) => {
  const pc = globalPC.value

  if (description) {
    const { type } = description
    const offerCollision =
      type === 'offer' && (makingOffer || pc.signalingState !== 'stable')
    ignoreOffer = !polite && offerCollision

    if (ignoreOffer) {
      return
    }

    try {
      await pc.setRemoteDescription(description)

      if (type === 'offer') {
        await pc.setLocalDescription()
        globalSocket.value.emit('web-rtc', roomId, {
          description: pc.localDescription
        })
      }
    } catch (error) {
      console.error(error)
    }
  } else if (candidate) {
    try {
      await pc.addIceCandidate(candidate)
    } catch (err) {
      if (!ignoreOffer) {
        console.error(err)
      }
    }
  }
}

// 移除 ossURL
const replaceOSSURLToURL = async (isImage, isAudio, hash, messageRecord) =>
  isImage
    ? await replaceImageOSSURLToURL(hash, messageRecord)
    : isAudio
      ? await replaceAudioOSSURLToURL(hash, messageRecord)
      : ''

const onReceiveMsg = async (messageRecord: message) => {
  const _lastMsgMap = lastMsgMap.value
  const { type, contact: id, hash } = messageRecord
  const isNotMedia = type !== 'image' && type !== 'audio'
  const isImage = type === 'image'
  const isAudio = type === 'audio'
  const inView = activeTargetIds.value.has(id)
  const url = await replaceOSSURLToURL(isImage, isAudio, hash, messageRecord)
  messageRecord.sent = false
  const label = useInitLabelAndSeparator(messageRecord, _lastMsgMap, id)
  const [indexdbLabel, indexdbMessageRecord] = useInitIndexedDBData(
    label,
    messageRecord
  )
  useAddPropsForMessageRecord(messageRecord, label, url)
  useAddMessageRecordToView(
    inView,
    label,
    messageRecord,
    messageRecordMap,
    id,
    true
  )
  await useInitLastMsg(_lastMsgMap, lastMsgList, matchRes, id)
  const item = useUpdateLastMsgToView(
    indexMap,
    lastMsgList,
    _lastMsgMap,
    isNotMedia
      ? messageRecord
      : { ...messageRecord, content: isImage ? '[图片]' : '[语音]' },
    true,
    inView,
    unreadMsgCounter
  )
  await useAddMessageRecordToDB(id, indexdbLabel, indexdbMessageRecord)
  await useUpdateLastMsgToDB(id, item)

  const { isBeepOpen, beep } = config.value.notification

  if (!inView && isBeepOpen) {
    if (playBeep) {
      const audio = beepAudioRef.value
      const src = `/audio/${beep}.mp3`

      // 可能会切换提示音
      if (audio.src !== src) {
        audio.src = src
      }

      audio.play()
      playBeep = false
      beepTimer = setTimeout(() => {
        playBeep = true
        clearTimeout(beepTimer)
      }, 3000)
    }
  }

  // toast.add({
  //   close: false,
  //   title: _lastMsgMap[id].nickname,
  //   description: content,
  //   avatar: {
  //     alt: _lastMsgMap[id].nickname[0]
  //   },
  //   duration: 3000,
  //   onClick: () => {}
  // })
}

// 将离线消息按照发送人进行分组
const mergeOfflineMsgs = offlineMsgs => {
  const grouped = {}

  for (let i = 0, l = offlineMsgs.length; i < l; i++) {
    const offlineMsg = offlineMsgs[i]
    const { contact } = offlineMsg

    if (!grouped[contact]) {
      grouped[contact] = []
    }

    grouped[contact].push(offlineMsg)
  }

  return grouped
}

const replaceImageOSSURLToURL = async (hash, messageRecord) => {
  let url = ''
  const _hashToBlobURLMap = hashToBlobURLMap.value
  const blobURL = _hashToBlobURLMap.get(hash)

  if (blobURL) {
    delete messageRecord.ossURL
    url = blobURL
  } else {
    try {
      const db = await useGetDB(userInfo.value.id)
      const tx = db.transaction('files', 'readwrite')
      const record = await tx.objectStore('files').get(hash)
      if (record) {
        delete messageRecord.ossURL
        url = URL.createObjectURL(record.blob)
        if (_hashToBlobURLMap.size < 100) {
          _hashToBlobURLMap.set(hash, url)
        }
      } else {
        const blob = await useURLToBlob(
          VITE_OSS_BASE_URL + messageRecord.ossURL
        )
        // tx 可能已经关闭，需要重新打开
        const tx = db.transaction('files', 'readwrite')
        await tx.objectStore('files').put({ hash, blob })
        delete messageRecord.ossURL
        url = URL.createObjectURL(blob)
        if (_hashToBlobURLMap.size < 100) {
          _hashToBlobURLMap.set(hash, url)
        }
      }
      await tx.done
    } catch {}
  }

  return url
}

const replaceAudioOSSURLToURL = async (hash, messageRecord) => {
  let url = ''

  try {
    const blob = await useURLToBlob(VITE_OSS_BASE_URL + messageRecord.ossURL)
    const db = await useGetDB(userInfo.value.id)
    const tx = db.transaction('files', 'readwrite')
    await tx.objectStore('files').put({ hash, blob })
    await tx.done
    delete messageRecord.ossURL
    url = URL.createObjectURL(blob)
  } catch {}

  return url
}

const onReceiveOfflineMsgs = async offlineMsgs => {
  if (!offlineMsgs.length) {
    isReceivingOfflineMsgs.value = false
    return
  }

  const grouped = mergeOfflineMsgs(offlineMsgs)
  const contacts = Object.keys(grouped)
  const _lastMsgMap = lastMsgMap.value

  for (let i = 0, l = contacts.length; i < l; i++) {
    const id = contacts[i]
    const offlineMsgs = grouped[id]
    const offlineMsgsLength = offlineMsgs.length
    // 接收离线消息时可能处于匹配聊天界面中，需要更新视图
    const inView = activeTargetIds.value.has(id)
    const __lastMsgMap: Record<string, { sent: boolean; timestamp: number }> = {
      [id]: (_lastMsgMap[id] as any) || {}
    }

    for (let i = 0; i < offlineMsgsLength; i++) {
      const messageRecord = offlineMsgs[i]
      const { type, hash } = messageRecord
      const isImage = type === 'image'
      const isAudio = type === 'audio'
      const url = await replaceOSSURLToURL(
        isImage,
        isAudio,
        hash,
        messageRecord
      )
      messageRecord.sent = false
      const label = useInitLabelAndSeparator(messageRecord, __lastMsgMap, id)
      const [indexdbLabel, indexdbMessageRecord] = useInitIndexedDBData(
        label,
        messageRecord
      )
      useAddPropsForMessageRecord(messageRecord, label, url)
      __lastMsgMap[id].sent = false
      __lastMsgMap[id].timestamp = messageRecord.timestamp
      await useAddMessageRecordToDB(id, indexdbLabel, indexdbMessageRecord)
    }

    const lastMsg = offlineMsgs[offlineMsgsLength - 1]
    const { type, duration } = lastMsg
    const isNotMedia = type !== 'image' && type !== 'audio'
    const isImage = type === 'image'

    await useInitLastMsg(_lastMsgMap, lastMsgList, matchRes, id)
    const item = useUpdateLastMsgToView(
      indexMap,
      lastMsgList,
      _lastMsgMap,
      isNotMedia
        ? lastMsg
        : { ...lastMsg, content: isImage ? '[图片]' : `[语音] ${duration}''` },
      true,
      inView,
      unreadMsgCounter,
      true,
      offlineMsgsLength
    )
    await useUpdateLastMsgToDB(id, item)

    if (i === l - 1) {
      isReceivingOfflineMsgs.value = false
    }
  }
}

const acceptWebRTC = async (targetProfile, roomId, now, isAccept: boolean) => {
  // 由于鼠标悬浮在 toast 上时会暂停进度，因此需要判断是否超出时间
  if (Date.now() - now <= voiceChatInviteToastExpireTime) {
    const socket = globalSocket.value
    const _targetId = useGetTargetIdByRoomId(roomId, userInfo)

    if (isAccept) {
      const isMicOpen = await useIsDeviceOpen(toast, 'microphone', '麦克风')
      webRTCTargetId.value = _targetId
      webRTCTargetProfile.value = targetProfile

      if (isMicOpen) {
        socket.emit('agree-unidirectional-web-rtc', roomId, _targetId)
      } else {
        socket.emit('agree-unidirectional-web-rtc-but-no-permission', _targetId)
        toast.add({
          title: '未开启麦克风权限',
          color: 'error',
          icon: 'lucide:annoyed'
        })
      }

      useSendMsg(
        isMicOpen ? 'voiceChatAgreeTip' : 'voiceChatAgreeButNoPermissionTip',
        '[语音通话]',
        null,
        null,
        null,
        null,
        null,
        null,
        _targetId,
        userInfo,
        globalSocket,
        messageRecordMap,
        lastMsgList,
        lastMsgMap,
        matchRes,
        indexMap,
        unreadMsgCounter,
        activeTargetIds.value.has(_targetId)
      )
    } else {
      socket.emit('refuse-web-rtc', roomId)
      useSendMsg(
        'voiceChatRefuseTip',
        '[语音通话]',
        null,
        null,
        null,
        null,
        null,
        null,
        _targetId,
        userInfo,
        globalSocket,
        messageRecordMap,
        lastMsgList,
        lastMsgMap,
        matchRes,
        indexMap,
        unreadMsgCounter,
        activeTargetIds.value.has(_targetId)
      )
    }
  } else {
    toast.add({ title: '超时', color: 'error', icon: 'lucide:annoyed' })
  }
}

const onInviteWebRTC = (roomId, targetId, targetProfile) => {
  const now = Date.now()

  voiceChatInviteToastId = toast.add({
    close: false,
    title: targetProfile.nickname,
    description: '邀请你语音通话',
    avatar: {
      src: `${VITE_OSS_BASE_URL}avatar/${targetId}`,
      alt: targetProfile.nickname[0]
    },
    duration: voiceChatInviteToastExpireTime,
    actions: [
      {
        icon: 'lucide:phone-missed',
        label: '拒绝',
        color: 'error',
        onClick: () => acceptWebRTC(targetProfile, roomId, now, false)
      },
      {
        icon: 'lucide:phone-incoming',
        label: '同意',
        color: 'primary',
        onClick: () => acceptWebRTC(targetProfile, roomId, now, true)
      }
    ]
  }).id
}

const onInviteWebRTCFailed = msg => {
  roomId.value = ''
  talkOverlay.close()
  clearTimeout(leaveRoomTimer.value)
  toast.add({
    title: msg,
    color: 'error',
    icon: 'lucide:annoyed'
  })
}

const onRefuseWebRTC = () => {
  globalSocket.value.emit('leave', roomId.value)
  talkOverlay.close()
  roomId.value = ''
  clearTimeout(leaveRoomTimer.value)
  toast.add({
    title: '对方拒绝了你的请求',
    color: 'error',
    icon: 'lucide:annoyed'
  })
}

const onDisconnect = reason => {
  // token 无效时，服务器会拒绝连接
  if (reason === 'io server disconnect') {
    localStorage.removeItem('token')
    location.replace('/login')
    return
  }

  // 匹配时连接服务器失败提示
  if (matching.value) {
    offline.value = true
    toast.add({
      title: '连接服务器失败...',
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }

  // 移动端将浏览器置于后台，几秒钟内返回，没有任何影响，但是如果在后台时间很长时，
  // 回来时会马上断开 socket 连接，之后重连，网络没有问题就会重连成功，连接成功
  // 回调中拉取离线消息，如果重连失败就会出现模态框
}

const onConnectError = () => {
  reconnectionAttempts++

  if (isOfflineModalOpen) {
    // 模态框打开时，首次连接可能失败，失败后会再进行重试，
    // 因此 reconnectionAttempts 的最大值为 maxReconnectionAttempts + 1
    if (
      reconnectionAttempts ===
      (firstConnectionSuccess
        ? maxReconnectionAttempts
        : maxReconnectionAttempts + 1)
    ) {
      if (isMobile.value) {
        // 移动端浏览器关闭后再打开，直接刷新页面
        location.reload()
      } else {
        toast.add({
          title: '重连失败，请检查网络后重试或刷新页面',
          color: 'error',
          icon: 'lucide:annoyed'
        })
        // 在断网模态框中的重连失败，取消 loading 状态，让用户再次点击
        offlineOverlay.patch({
          reconnecting: false
        })
        firstConnectionSuccess = false
        // 同时需要重置尝试次数
        reconnectionAttempts = 0
      }
    }
  } else if (
    reconnectionAttempts ===
    (firstConnectionSuccess
      ? maxReconnectionAttempts
      : maxReconnectionAttempts + 1)
  ) {
    // 首次连接可能失败，如果失败，
    // reconnectionAttempts 的最大值为 maxReconnectionAttempts + 1
    // 如果成功连接后断开，重连时 reconnectionAttempts 的最大值为
    // maxReconnectionAttempts

    // 当模态框未打开时，重试次数满了就打开模态框
    isOfflineModalOpen = true
    // 同时需要重置尝试次数
    reconnectionAttempts = 0
    firstConnectionSuccess = false
    offlineOverlay.open({
      reconnecting: false,
      onReconnect
    })
  }
}

const onMatched = async data => {
  const { status, matchRes: _matchRes } = data

  if (status === 'fail') {
    noMatch.value = true

    // 不需要重新发送匹配，因为仍在匹配列表中
    matchTimer = setTimeout(() => {
      noMatch.value = false
      clearTimeout(matchTimer)
    }, 2000)
  } else if (status === 'success') {
    // 可能出现未匹配到对方，等待再次匹配的过程中被别人给匹配到了
    clearTimeout(matchTimer)
    hasMatchRes.value = true
    matchRes.value = _matchRes
    const { id } = userInfo.value
    localStorage.setItem(`matchRes-${id}`, JSON.stringify(_matchRes))
    matching.value = false

    // TODO: 处理匹配结果是好友的情况
    if (_matchRes.type === 'talk') {
      const _lastMsgMap = lastMsgMap.value
      const targetId = _matchRes.id
      await useInitLastMsg(_lastMsgMap, lastMsgList, matchRes, targetId)
      const db = await useGetDB(id)
      await db.put(
        'lastMessages',
        JSON.parse(JSON.stringify(_lastMsgMap[targetId]))
      )
    }

    router.replace(`/match-to-${_matchRes.type}`)
  }
}

// 对方断开 web rtc 时，这里能够马上知道，从而手动断开 pc，否则 pc 断开要过好几秒
// 才会自动触发
const onBye = _roomId => {
  rtcConnected.value = false
  const pc = globalPC.value
  pc.close()
  globalPC.value = null
  useCloseMediaStreamTracks(localMediaStream.value)
  globalSocket.value.emit('leave', _roomId)
  roomId.value = ''
  toast.add({
    title: '对方结束了通话',
    color: 'error',
    icon: 'lucide:annoyed'
  })

  if (isVoiceChatMatch.value) {
    router.replace('/')
  }

  talkOverlay.close()
}

const onCancelWebRTC = () => {
  toast.remove(voiceChatInviteToastId)
  toast.add({ title: '对方取消了通话', color: 'error', icon: 'lucide:annoyed' })
}

const onOtherWebRTC = () => {
  toast.add({
    title: '已经在房间中了',
    color: 'error',
    icon: 'lucide:annoyed'
  })
}

const onRefreshNotifications = notifications => {
  const _homeNotifications = notifications.filter(
    item =>
      item.type === 'feedback' ||
      item.type === 'reporter' ||
      item.type === 'reported'
  )
  const _contactNotifications = notifications.filter(
    item => item.type === 'contact'
  )
  const __homeNotifications = homeNotifications.value
  const __contactNotifications = contactNotifications.value
  const homeNotificationsLength = _homeNotifications.length
  const contactNotificationsLength = _contactNotifications.length
  const { id } = userInfo.value

  if (homeNotificationsLength) {
    __homeNotifications.unshift(..._homeNotifications)
    unreadHomeNotificationCount.value += homeNotificationsLength
    localStorage.setItem(
      `homeNotifications-${id}`,
      JSON.stringify(__homeNotifications)
    )
    localStorage.setItem(
      `unreadHomeNotificationCount-${id}`,
      String(unreadHomeNotificationCount.value)
    )
  }

  if (contactNotificationsLength) {
    __contactNotifications.unshift(..._contactNotifications)
    unreadContactNotificationCount.value += contactNotificationsLength
    localStorage.setItem(
      `contactNotifications-${id}`,
      JSON.stringify(_contactNotifications)
    )
    localStorage.setItem(
      `unreadContactNotificationCount-${id}`,
      String(unreadContactNotificationCount.value)
    )
  }
}

const onGetOnlineStatus = (type, res) => {
  const ids = Object.keys(res)
  const isMessageList = type === 'messageList'

  if (isMessageList || type === 'contactList') {
    const map = isMessageList ? lastMsgMap.value : contactProfileMap.value

    for (let i = 0, l = ids.length; i < l; i++) {
      const id = ids[i]
      const onlineStatus = res[id]
      const { profile } = map[id]

      // 只有状态发生改变时才更新
      if (profile?.onlineStatus?.isOnline !== onlineStatus.isOnline) {
        profile.onlineStatus = onlineStatus
      }
    }

    isMessageList
      ? (isFirstGetChatsOnlineStatus.value = false)
      : (isFirstGetContactsOnlineStatus.value = false)
  } else if (type === 'matchTarget') {
    const { profile } = matchRes.value
    const onlineStatus = res[ids[0]]

    if (profile?.onlineStatus?.isOnline !== onlineStatus.isOnline) {
      profile.onlineStatus = onlineStatus
    }
  }
}

const onGetOnlineCount = v => (onlineCount.value = v)

const onRefreshToken = token => {
  localStorage.setItem('token', token)
  location.reload()
}

const onRefreshVersion = () => location.reload()

const onAgreeWebRTCButNoPermission = () => {
  talkOverlay.close()
  roomId.value = ''
  clearTimeout(leaveRoomTimer.value)
  toast.add({
    title: '对方同意了语音请求，但是未开启麦克风权限',
    color: 'error',
    icon: 'lucide:annoyed'
  })
}

const createSocket = (emit = null) => {
  const socket = (globalSocket.value = io(
    import.meta.env.VITE_SOCKET_BASE_URL,
    {
      reconnectionAttempts: maxReconnectionAttempts,
      auth: {
        version: VITE_VERSION,
        token: localStorage.getItem('token')
      }
    }
  ))

  // 连接成功
  socket.on('connect', () => onConnect(emit))
  // 断开连接
  socket.on('disconnect', onDisconnect)
  // 连接成功后，手动断开连接，不会触发，只会在最开始建立连接失败时或者连接成功后，连接
  // 断开，进行重连失败时触发，移动端关闭浏览器后，再打开浏览器后也会触发这个回调
  socket.on('connect_error', onConnectError)

  return socket
}

const initSocket = socket => {
  // 成功加入房间
  socket.on('joined', onJoined)
  // 对方成功加入房间
  socket.on('otherjoin', onOtherJoin)
  // web rtc
  socket.on('web-rtc', onWebRTC)
  // 好友请求
  socket.on('add-contact', onAddContact)
  // 对方同意了我的好友请求
  socket.on('agree-contact', onAgreeContact)
  // 对方拒绝了我的好友请求
  socket.on('refuse-contact', onRefuseContact)
  // 对方将我从好友列表中移除了
  socket.on('delete-contact', onDeleteContact)
  // 在我离线时，有人同意了我的好友请求，在线时需要刷新好友列表
  socket.on('refresh-contacts', onRefreshContacts)
  // 接收消息
  socket.on('receive-msg', onReceiveMsg)
  // 接收的离线消息
  socket.on('receive-offline-msgs', onReceiveOfflineMsgs)
  // 邀请对方进行 web rtc
  socket.on('invite-web-rtc', onInviteWebRTC)
  // 邀请对方进行 web rtc 失败，对方可能不在线或者忙线
  socket.on('invite-web-rtc-failed', onInviteWebRTCFailed)
  // 邀请对方进行 web rtc，但是对方拒绝
  socket.on('refuse-web-rtc', onRefuseWebRTC)
  // 邀请对方进行 web rtc，但是在对方接受前我手动取消了
  socket.on('cancel-web-rtc', onCancelWebRTC)
  // 邀请对方进行 web rtc，对方同意了，但是在你之前，对方刚刚同意了别人的请求，已经
  // 进入别人的房间了
  socket.on('other-web-rtc', onOtherWebRTC)
  // 邀请对方进行 web rtc，对方同意了，但是对方没有开启麦克风权限
  socket.on(
    'agree-unidirectional-web-rtc-but-no-permission',
    onAgreeWebRTCButNoPermission
  )
  // 匹配成功
  socket.on('matched', onMatched)
  // 对方结束了 web rtc
  socket.on('bye', onBye)
  // 通知
  socket.on('refresh-notifications', onRefreshNotifications)
  // 在线状态
  socket.on('get-online-status', onGetOnlineStatus)
  socket.on('get-online-count', onGetOnlineCount)
  socket.on('refresh-token', onRefreshToken)
  socket.on('refresh-version', onRefreshVersion)
  socket.emit('ready')
}

const initLastMsgs = async () => {
  let _lastMsgMap = {}
  let _unreadMsgCounter = 0
  const db = await useGetDB(userInfo.value.id)
  const lastMsgs = (await db.getAll('lastMessages')).sort(
    (a, b) => b.timestamp - a.timestamp
  )
  const _lastMsgList = []
  const _indexMap = {}

  for (let i = 0, l = lastMsgs.length; i < l; i++) {
    const lastMsg = lastMsgs[i]
    const { id, unreadMsgs } = lastMsg
    _indexMap[id] = i
    _lastMsgList.push(id)
    _lastMsgMap[id] = lastMsg
    _unreadMsgCounter += unreadMsgs || 0
  }

  indexMap.value = _indexMap
  lastMsgMap.value = _lastMsgMap
  lastMsgList.value = _lastMsgList
  unreadMsgCounter.value = _unreadMsgCounter
}

const initChatBgURL = async () => {
  const chatBgBlob = (
    await (await useGetDB(userInfo.value.id)).get('chatBg', userInfo.value.id)
  )?.blob
  config.value.theme.chatBg = chatBgBlob ? URL.createObjectURL(chatBgBlob) : ''
}

const initBeep = () => {
  if (!isMobile.value) {
    return
  }

  // 用户发生交互行为时，播放音频并马上暂停，这样后续消息提示音才能自动播放
  const onTouchstart = () => {
    beepAudioRef.value.play()
    window.removeEventListener('touchstart', onTouchstart)
  }
  window.addEventListener('touchstart', onTouchstart)
}

onBeforeMount(async () => {
  if (userInfo.value?.id) {
    // 优先创建 socket
    const socket = createSocket()
    // 先获取本地数据库中的数据
    await initLastMsgs()
    await initChatBgURL()

    if (VITE_ENV === 'production') {
      const {
        data: { province, city }
      } = await getGeoInfoAPI()
      userInfo.value.ipInfo = {
        province,
        city
      }
    } else {
      userInfo.value.ipInfo = {
        province: '福建省',
        city: '厦门市'
      }
    }

    // 拉取离线数据后，更新本地数据库中的数据和内存中的数据
    initSocket(socket)
  }
})

onMounted(async () => {
  initBeep()
  setInterval(() => {
    globalSocket.value.emit('get-online-count')
  }, 1000 * 60)
})
</script>

<style>
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}
::view-transition-new(root) {
  z-index: 9999;
}
::view-transition-old(root) {
  z-index: 1;
}
</style>
