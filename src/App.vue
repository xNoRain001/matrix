<template>
  <Suspense>
    <UApp
      v-if="userInfo"
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
            <img
              class="size-8"
              style="filter: drop-shadow(rgba(0, 122, 204, 0.3) 0px 8px 24px)"
              src="/images/logo.svg"
            />
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
              <template #message-trailing>
                <UBadge
                  v-if="unreadMsgCounter"
                  :label="unreadMsgCounter"
                  size="sm"
                /> </template
            ></UNavigationMenu>

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
        <IndexNotificationsSlideover />
        <!-- 移动端底部导航栏 -->
        <IndexFooter v-if="isMobile"></IndexFooter>
      </UDashboardGroup>

      <!-- 语音聊天 -->
      <UModal
        fullscreen
        :overlay="false"
        v-model:open="isVoiceChatModalOpen"
        title=" "
        description=" "
      >
        <template #body>
          <MessageVoice></MessageVoice>
        </template>
      </UModal>
      <!-- 语音通话浮动按钮 -->
      <UButton
        v-if="roomId"
        @click="isVoiceChatModalOpen = true"
        icon="lucide:phone"
        class="absolute top-20 right-4"
      ></UButton>
      <!-- 音频 -->
      <audio hidden ref="localAudioRef" muted></audio>
      <audio hidden ref="remoteAudioRef" autoplay></audio>
    </UApp>

    <!-- 注册登录和重置密码等内容 -->
    <UApp v-else :toaster="{ position: 'top-center' }">
      <RouterView />
    </UApp>
  </Suspense>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import {
  useMatchStore,
  useRecentContactsStore,
  useUserStore,
  useWebRTCStore
} from './store'
import { computed, watch } from 'vue'
import type { NavigationMenuItem } from '@nuxt/ui'
import ModalLogout from './components/modal/ModalLogout.vue'
import DrawerLogout from './components/drawer/DrawerLogout.vue'
import { io } from 'socket.io-client'
import {
  useAddLastMsg,
  useAddMediaStreamToPC,
  useBindMediaStream,
  useCloseMediaStreamTracks,
  useGetDB,
  useGetTargetIdByRoomId,
  useGetUserMedia,
  useIsOverFiveMins,
  usePauseMediaStreamTracks,
  useResumeMediaStreamTracks,
  useScrollToBottom,
  useAddMessageRecordToView,
  useAddMessageRecordToDB,
  useUpdateLastMsg
} from './hooks'
import { useRouter } from 'vue-router'
import { voiceChatInviteToastExpireTime } from './const'
import type { lastMsg, lastMsgMap } from './types'

let voiceChatInviteToastId = null
let matchTimer = null
let ignoreOffer = false
let polite = true
let makingOffer = false
const toast = useToast()
const overlay = useOverlay()
const logoutModal = overlay.create(ModalLogout)
const logoutDrawer = overlay.create(DrawerLogout)
const { isMobile, globalSocket, globalPC, userInfo } =
  storeToRefs(useUserStore())
const {
  leaveRoomTimer,
  rtcConnected,
  isVoiceChatModalOpen,
  isVoiceChatMatch,
  roomId,
  localAudioRef,
  remoteAudioRef,
  localMediaStream,
  isMicOpen,
  isSpeakerOpen
} = storeToRefs(useWebRTCStore())
const {
  msgContainerRef,
  unreadMsgCounter,
  targetId,
  messageList,
  lastMsgMap,
  lastMsgList
} = storeToRefs(useRecentContactsStore())
const { matchRes, matchType, hasMatchRes, offline, matching, noMatch } =
  storeToRefs(useMatchStore())
const navs = [
  [
    {
      label: '大厅',
      icon: 'lucide:cat',
      to: '/'
    },
    {
      label: '好友',
      icon: 'lucide:users-round',
      to: '/contacts'
    },
    {
      label: '消息',
      icon: 'lucide:message-circle',
      to: '/message',
      slot: 'message'
    },
    {
      label: '我的',
      icon: 'ic:baseline-face',
      to: '/profile/space',
      defaultOpen: true,
      type: 'trigger',
      children: [
        {
          label: '空间',
          to: '/profile/space',
          exact: true
        },
        {
          label: '修改资料',
          to: '/profile/user-info'
        },
        {
          label: '修改密码',
          to: '/profile/update-password'
        },
        {
          label: '通知',
          to: '/profile/notifications'
        },
        {
          label: '登出',
          onSelect: () => {
            isMobile.value ? logoutDrawer.open() : logoutModal.open()
          }
        }
      ]
    }
  ],
  [
    {
      label: '反馈',
      icon: 'i-lucide-message-circle',
      to: '',
      target: '_blank'
    },
    {
      label: '帮助和支持',
      icon: 'i-lucide-info',
      to: '',
      target: '_blank'
    }
  ]
] satisfies NavigationMenuItem[][]
const groups = computed(() => [
  {
    id: 'links',
    label: '访问',
    items: navs.flat()
  }
])
const id = computed(() => userInfo.value?.id || '')
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
    { urls: 'stun:106.53.49.148:3478' },
    // TURN 服务器配置
    {
      urls: 'turn:106.53.49.148:3478',
      username: 'test',
      credential: 'test123'
    }
  ],
  iceTransportPolicy: 'all', // 可选: 'all' | 'relay'
  bundlePolicy: 'max-bundle', // 可选: 'balanced' | 'max-compat' | 'max-bundle'
  rtcpMuxPolicy: 'require', // 可选: 'require'
  iceCandidatePoolSize: 0 // 可选: 0~N，通常为0
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

const onAddContact = targetId => {
  targetId
}

const onRefuseWebRTCContact = toast => {
  toast.add({
    title: '对方拒绝了你的好友请求',
    color: 'error'
  })
}

const onAgreeContact = toast => {
  toast.add({
    title: '添加好友成功',
    color: 'success'
  })
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
    remoteAudioRef.value.volume = isSpeakerOpen.value ? 1 : 0
    // 绑定本地流
    useBindMediaStream(localAudioRef.value, _localMediaStream)
    useAddMediaStreamToPC(globalPC.value, _localMediaStream)
  } catch (err) {
    console.error(err)
    console.log('未获取到用户设备')
    isMicOpen.value = false
  }
}

const onJoined = async (_roomId, _polite) => {
  roomId.value = _roomId

  if (!isVoiceChatMatch.value) {
    isVoiceChatModalOpen.value = true
  } else if (_polite) {
    // 处理匹配语音通话时其中一方刷新页面后，能够恢复通话
    // 先进来的一方，规定时间内无法等到对方加入，判断为对方离开了房间
    leaveRoomTimer.value = setTimeout(() => {
      globalSocket.value.emit('leave', roomId.value)
      roomId.value = ''
      clearTimeout(leaveRoomTimer.value)
      matchType.value = ''
      matchRes.value = null
      localStorage.removeItem('matchRes')
      localStorage.removeItem('matchType')
      toast.add({
        title: '对方已离开房间',
        color: 'error'
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

const onReceiveMsg = async messageRecord => {
  messageRecord.sent = false
  const _lastMsgMap = lastMsgMap.value
  const { contact: id } = messageRecord
  const inView = targetId.value === id
  const isOverFiveMins = useIsOverFiveMins(messageRecord, _lastMsgMap, id)

  if (!_lastMsgMap[id]) {
    await useAddLastMsg(_lastMsgMap, lastMsgList, matchRes, id)
  }

  await useAddMessageRecordToDB(isOverFiveMins, messageRecord, _lastMsgMap)

  if (inView) {
    useAddMessageRecordToView(isOverFiveMins, messageRecord, messageList)
    useScrollToBottom(msgContainerRef)
  }

  useUpdateLastMsg(_lastMsgMap, messageRecord, true, inView, unreadMsgCounter)

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

const onReceiveOfflineMsgs = async offlineMsgs => {
  const grouped = mergeOfflineMsgs(offlineMsgs)
  const contacts = Object.keys(grouped)

  for (let i = 0, l = contacts.length; i < l; i++) {
    const id = contacts[i]
    const offlineMsgs = grouped[id]
    const offlineMsgsLength = offlineMsgs.length
    // 接收离线消息时可能处于匹配聊天界面中，需要更新视图
    const inView = targetId.value === id
    const _lastMsgMap = lastMsgMap.value
    // 跳过分隔符判断逻辑
    const skip = _lastMsgMap[id]?.sent !== offlineMsgs[0].sent

    for (let i = 0; i < offlineMsgsLength; i++) {
      const messageRecord = offlineMsgs[i]
      messageRecord.sent = false
      const isOverFiveMins = useIsOverFiveMins(messageRecord, _lastMsgMap, id)
      await useAddMessageRecordToDB(
        isOverFiveMins,
        messageRecord,
        _lastMsgMap,
        skip
      )

      if (inView) {
        useAddMessageRecordToView(isOverFiveMins, messageRecord, messageList)
      }
    }

    if (inView) {
      useScrollToBottom(msgContainerRef)
    }

    const lastMsg = offlineMsgs[offlineMsgsLength - 1]

    if (!_lastMsgMap[id]) {
      await useAddLastMsg(_lastMsgMap, lastMsgList, matchRes, id)
    }

    useUpdateLastMsg(
      _lastMsgMap,
      lastMsg,
      true,
      inView,
      unreadMsgCounter,
      true,
      offlineMsgsLength
    )
  }
}

const acceptWebRTC = (roomId, now, isAccept: boolean) => {
  // 由于鼠标悬浮在 toast 上时会暂停进度，因此需要判断是否超出时间
  if (Date.now() - now <= voiceChatInviteToastExpireTime) {
    const socket = globalSocket.value

    if (isAccept) {
      socket.emit(
        'agree-unidirectional-web-rtc',
        roomId,
        useGetTargetIdByRoomId(roomId, userInfo)
      )
    } else {
      socket.emit('refuse-web-rtc', roomId)
    }
  } else {
    toast.add({ title: '超时', color: 'error' })
  }
}

const onInviteWebRTC = (roomId, nickname) => {
  const now = Date.now()

  voiceChatInviteToastId = toast.add({
    close: false,
    title: nickname,
    description: '邀请你语音通话',
    avatar: {
      alt: nickname[0]
    },
    duration: voiceChatInviteToastExpireTime,
    actions: [
      {
        icon: 'lucide:x',
        label: '拒绝',
        color: 'error',
        onClick: () => acceptWebRTC(roomId, now, false)
      },
      {
        icon: 'lucide:check',
        label: '同意',
        color: 'primary',
        onClick: () => acceptWebRTC(roomId, now, true)
      }
    ]
  }).id
}

const onInviteWebRTCFailed = msg => {
  roomId.value = ''
  isVoiceChatModalOpen.value = false
  clearTimeout(leaveRoomTimer.value)
  toast.add({
    title: msg,
    color: 'error'
  })
}

const onRefuseWebRTC = () => {
  globalSocket.value.emit('leave', roomId.value)
  isVoiceChatModalOpen.value = false
  roomId.value = ''
  clearTimeout(leaveRoomTimer.value)
  toast.add({
    title: '对方拒绝了你的请求',
    color: 'error'
  })
}

const onDisconnect = () => {
  // 匹配成功时会跳转路由，关闭 modal,只写 !matching.value 会出现匹配成功时出现
  // 连接服务器失败提示
  if (!matching.value && !hasMatchRes.value) {
    offline.value = true
    toast.add({
      title: '连接服务器失败...',
      color: 'error'
    })
  }
}

const onMatched = data => {
  const { status, matchType: _matchType, matchRes: _matchRes } = data

  if (status === 'fail') {
    noMatch.value = true

    // 不需要重新发送匹配，因为仍在匹配列表中
    matchTimer = setTimeout(() => {
      noMatch.value = false
      clearTimeout(matchTimer)
    }, 2000)
  } else if (status === 'suc') {
    // 可能出现未匹配到对方，等待再次匹配的过程中被别人给匹配到了
    clearTimeout(matchTimer)
    hasMatchRes.value = true
    matchType.value = _matchType
    matchRes.value = _matchRes
    localStorage.setItem('matchType', _matchType)
    localStorage.setItem('matchRes', JSON.stringify(_matchRes))
    matching.value = false
    router.replace(`/${_matchType}`)
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
    color: 'error'
  })

  if (isVoiceChatMatch.value) {
    router.replace('/')
  }

  isVoiceChatModalOpen.value = false
}

const onCancelWebRTC = () => {
  toast.remove(voiceChatInviteToastId)
  toast.add({ title: '对方取消了通话', color: 'error' })
}

const onOtherWebRTC = () => {
  toast.add({
    title: '已经在房间中了',
    color: 'error'
  })
}

const initWebRTC = id => {
  // 未登录或者登出
  if (!id) {
    const socket = globalSocket.value
    const pc = globalPC.value

    if (pc) {
      pc.close()
      globalPC.value = null
    }

    socket && socket.disconnect()
    globalSocket.value = null
    return
  }

  const socket = (globalSocket.value = io(
    import.meta.env.VITE_SOCKET_BASE_URL,
    {
      // reconnectionAttempts: maxReconnectionAttempts,
      auth: {
        id
      }
    }
  ))

  // 建立连接
  socket.on('connect', () => {})
  // 成功加入房间
  socket.on('joined', onJoined)
  // 对方成功加入房间
  socket.on('otherjoin', onOtherJoin)
  // web rtc
  socket.on('web-rtc', onWebRTC)
  // 好友请求
  socket.on('add-contact', onAddContact)
  // 拒绝好友请求
  socket.on('refuse-contact', onRefuseWebRTCContact)
  // 同意好友请求
  socket.on('agree-contact', onAgreeContact)
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
  // 断开连接
  socket.on('disconnect', onDisconnect)
  // 匹配成功
  socket.on('matched', onMatched)
  // 对方结束了 web rtc
  socket.on('bye', onBye)
}

const initLastMsgs = async () => {
  // TODO: lastMsgMap 和 lastMsgList 完整性检查
  let _lastMsgMap: lastMsgMap = {}
  let _unreadMsgCounter = 0
  const db = await useGetDB()
  const lastMsgs: lastMsg[] = await db.getAll('lastMessages')
  const _lastMsgList = []

  try {
    _lastMsgMap = JSON.parse(localStorage.getItem('profileMap') || '{}')
  } catch {}

  for (let i = 0, l = lastMsgs.length; i < l; i++) {
    const lastMsg = lastMsgs[i]
    const { id, unreadMsgs } = lastMsg
    _lastMsgList.push(id)
    _lastMsgMap[id] = { ..._lastMsgMap[id], ...lastMsg }
    _unreadMsgCounter += unreadMsgs
    // delete _lastMsgMap[id].id
  }

  lastMsgMap.value = _lastMsgMap
  lastMsgList.value = _lastMsgList
  unreadMsgCounter.value = _unreadMsgCounter
}

watch(
  id,
  async id => {
    // 先获取本地数据库中的数据
    await initLastMsgs()
    // 拉取离线数据后，更新本地数据库中的数据和内存中的数据
    initWebRTC(id)
  },
  { immediate: true }
)
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
