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
              /></template>
              <template #contacts-trailing>
                <UBadge
                  v-if="contactNotifications.length"
                  :label="contactNotifications.length"
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
        <IndexFooter v-if="isMobile"></IndexFooter>
      </UDashboardGroup>

      <!-- 语音聊天 -->
      <UModal
        fullscreen
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
        class="absolute top-4 right-4"
      ></UButton>
      <!-- 音频 -->
      <audio hidden ref="localAudioRef" muted></audio>
      <audio hidden ref="remoteAudioRef" autoplay></audio>
    </UApp>

    <!-- 注册登录和重置密码等内容 -->
    <UApp v-else :toaster="{ position: 'top-center', progress: false }">
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
import { computed, onMounted, watch } from 'vue'
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
  usePauseMediaStreamTracks,
  useResumeMediaStreamTracks,
  useAddMessageRecordToView,
  useAddMessageRecordToDB,
  useUpdateLastMsg,
  useRefreshContacts,
  useInitLabelAndSeparator,
  useUUID,
  useSendMsg
} from './hooks'
import { useRouter } from 'vue-router'
import { voiceChatInviteToastExpireTime } from './const'
import type { lastMsg, lastMsgMap } from './types'

let voiceChatInviteToastId = null
let matchTimer = null
let ignoreOffer = false
let polite = true
let makingOffer = false
let beepTimer = null
let playBeep = true
const toast = useToast()
const overlay = useOverlay()
const logoutModal = overlay.create(ModalLogout)
const logoutDrawer = overlay.create(DrawerLogout)
const { notifications, isMobile, globalSocket, globalPC, userInfo, config } =
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
  lastMsgList,
  contactNotifications,
  contactList,
  contactProfileMap,
  hashToBlobURLMap,
  indexMap
} = storeToRefs(useRecentContactsStore())
const { matchRes, matchType, hasMatchRes, offline, matching, noMatch } =
  storeToRefs(useMatchStore())
const navs = [
  [
    {
      label: '大厅',
      icon: 'lucide:bubbles',
      to: '/'
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
      to: '/message',
      slot: 'message'
    },
    {
      label: '我的',
      icon: 'lucide:user-round-cog',
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
          label: '数据管理',
          to: '/profile/fixer'
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
    echoCancellation: false, // 回声消除
    noiseSuppression: false, // 降噪
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

const onAddContact = async notification => {
  toast.add({
    title: notification.profile.nickname,
    description: '请求添加你为好友',
    avatar: {
      alt: notification.profile.nickname[0]
    }
  })
  const _contactNotifications = contactNotifications.value
  _contactNotifications.unshift(notification)
  localStorage.setItem(
    `contactNotifications-${userInfo.value.id}`,
    JSON.stringify(_contactNotifications)
  )
}

const onAgreeContact = (notification, contact) => {
  const _contactNotifications = contactNotifications.value
  _contactNotifications.unshift(notification)
  const { id } = userInfo.value
  localStorage.setItem(
    `contactNotifications-${id}`,
    JSON.stringify(_contactNotifications)
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
  _contactNotifications.unshift(notification)
  localStorage.setItem(
    `contactNotifications-${userInfo.value.id}`,
    JSON.stringify(_contactNotifications)
  )
}

const onDeleteContact = (notification, targetId) => {
  const _contactNotifications = contactNotifications.value
  _contactNotifications.unshift(notification)
  const { id } = userInfo.value
  localStorage.setItem(
    `contactNotifications-${id}`,
    JSON.stringify(_contactNotifications)
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
      const { id } = userInfo.value
      localStorage.removeItem(`matchRes-${id}`)
      localStorage.removeItem(`matchType-${id}`)
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

const onReceiveMsg = async messageRecord => {
  let url = ''
  const _lastMsgMap = lastMsgMap.value
  const { type, contact: id, hash } = messageRecord
  const isText = type === 'text'
  const isImage = type === 'image'
  const isAudio = type === 'audio'
  const inView = targetId.value === id && msgContainerRef.value
  messageRecord.sent = false
  const label = useInitLabelAndSeparator(messageRecord, _lastMsgMap, id)

  // 可能会移除 ossURL
  if (isImage) {
    url = await replaceImageOSSURLToURL(hash, messageRecord)
  }

  if (isAudio) {
    url = await replaceAudioOSSURLToURL(hash, messageRecord)
  }

  const indexdbLabel = label ? { ...label } : null
  const indexdbMessageRecord = { ...messageRecord }

  // 不需要加 isImage 判断，因为就算是图片也依旧需要判断 url 是否有值，因此直接判断
  // url 是否有值，如果 url 值为 ''，由 ossURL 接管
  if (url) {
    messageRecord.url = url
  }

  if (label) {
    label.id = useUUID()
  }

  messageRecord.id = useUUID()

  if (inView) {
    useAddMessageRecordToView(label, messageRecord, messageList)
    ;(msgContainerRef.value as any).scrollToBottom()
  }

  await useAddLastMsg(_lastMsgMap, lastMsgList, matchRes, id)
  await useAddMessageRecordToDB(
    userInfo.value.id,
    indexdbLabel,
    indexdbMessageRecord
  )

  useUpdateLastMsg(
    userInfo.value.id,
    indexMap,
    lastMsgList,
    _lastMsgMap,
    isText
      ? messageRecord
      : { ...messageRecord, content: isImage ? '[图片]' : '[语音]' },
    true,
    inView,
    unreadMsgCounter
  )

  if (!inView && config.value.beep) {
    if (playBeep) {
      const audio = new Audio('/audio/beep.mp3')
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

const ossURLToBlob = async messageRecord => {
  const response = await fetch(messageRecord.ossURL)
  const arrayBuffer = await response.arrayBuffer()
  return new Blob([arrayBuffer])
}

const replaceImageOSSURLToURL = async (hash, messageRecord) => {
  let url = ''
  const _hashToBlobURLMap = hashToBlobURLMap.value
  const blobURL = _hashToBlobURLMap.get(hash)

  if (blobURL) {
    delete messageRecord.ossURL
    url = blobURL
  } else {
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
      const blob = await ossURLToBlob(messageRecord)
      await tx.objectStore('files').put({ hash, blob })
      delete messageRecord.ossURL
      url = URL.createObjectURL(blob)
      if (_hashToBlobURLMap.size < 100) {
        _hashToBlobURLMap.set(hash, url)
      }
    }
    await tx.done
  }

  return url
}

const replaceAudioOSSURLToURL = async (hash, messageRecord) => {
  const blob = await ossURLToBlob(messageRecord)
  const db = await useGetDB(userInfo.value.id)
  const tx = db.transaction('files', 'readwrite')
  await tx.objectStore('files').put({ hash, blob })
  await tx.done
  delete messageRecord.ossURL
  return URL.createObjectURL(blob)
}

const onReceiveOfflineMsgs = async offlineMsgs => {
  const grouped = mergeOfflineMsgs(offlineMsgs)
  const contacts = Object.keys(grouped)
  const _lastMsgMap = lastMsgMap.value

  for (let i = 0, l = contacts.length; i < l; i++) {
    const id = contacts[i]
    const offlineMsgs = grouped[id]
    const offlineMsgsLength = offlineMsgs.length
    // 接收离线消息时可能处于匹配聊天界面中，需要更新视图
    const inView = targetId.value === id && msgContainerRef.value
    const __lastMsgMap: Record<string, { sent: boolean; timestamp: number }> = {
      [id]: (_lastMsgMap[id] as any) || {}
    }

    for (let i = 0; i < offlineMsgsLength; i++) {
      let url = ''
      const messageRecord = offlineMsgs[i]
      const { type, hash } = messageRecord
      const isImage = type === 'image'
      const isAudio = type === 'audio'
      messageRecord.sent = false
      const label = useInitLabelAndSeparator(messageRecord, _lastMsgMap, id)

      if (isImage) {
        url = await replaceImageOSSURLToURL(hash, messageRecord)
      }

      if (isAudio) {
        url = await replaceAudioOSSURLToURL(hash, messageRecord)
      }

      const indexdbLabel = { ...label }
      // 本地数据库中不需要保存临时的 url
      const indexdbMessageRecord = { ...messageRecord, url: '' }

      if (url) {
        messageRecord.url = url
      }

      if (label) {
        label.id = useUUID()
      }

      messageRecord.id = useUUID()

      __lastMsgMap[id].sent = false
      __lastMsgMap[id].timestamp = messageRecord.timestamp

      if (inView) {
        useAddMessageRecordToView(label, messageRecord, messageList)
      }

      await useAddMessageRecordToDB(
        userInfo.value.id,
        indexdbLabel,
        indexdbMessageRecord
      )
    }

    if (inView) {
      ;(msgContainerRef.value as any).scrollToBottom()
    }

    const lastMsg = offlineMsgs[offlineMsgsLength - 1]
    const { type, duration } = lastMsg
    const isText = type === 'text'
    const isImage = type === 'image'

    await useAddLastMsg(_lastMsgMap, lastMsgList, matchRes, id)
    await useUpdateLastMsg(
      userInfo.value.id,
      indexMap,
      lastMsgList,
      _lastMsgMap,
      isText
        ? lastMsg
        : { ...lastMsg, content: isImage ? '[图片]' : `[语音] ${duration}''` },
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
    const _targetId = useGetTargetIdByRoomId(roomId, userInfo)

    if (isAccept) {
      socket.emit('agree-unidirectional-web-rtc', roomId, _targetId)
      useSendMsg(
        'text',
        '同意了语音通话',
        null,
        null,
        null,
        null,
        null,
        null,
        _targetId,
        userInfo,
        globalSocket,
        messageList,
        lastMsgList,
        lastMsgMap,
        matchRes,
        indexMap,
        unreadMsgCounter,
        msgContainerRef,
        _targetId === targetId.value && msgContainerRef.value
      )
    } else {
      socket.emit('refuse-web-rtc', roomId)
      useSendMsg(
        'text',
        '拒绝了语音通话',
        null,
        null,
        null,
        null,
        null,
        null,
        _targetId,
        userInfo,
        globalSocket,
        messageList,
        lastMsgList,
        lastMsgMap,
        matchRes,
        indexMap,
        unreadMsgCounter,
        msgContainerRef,
        _targetId === targetId.value && msgContainerRef.value
      )
    }
  } else {
    toast.add({ title: '超时', color: 'error', icon: 'lucide:annoyed' })
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
        icon: 'lucide:phone-off',
        label: '拒绝',
        color: 'error',
        onClick: () => acceptWebRTC(roomId, now, false)
      },
      {
        icon: 'lucide:phone',
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
    color: 'error',
    icon: 'lucide:annoyed'
  })
}

const onRefuseWebRTC = () => {
  globalSocket.value.emit('leave', roomId.value)
  isVoiceChatModalOpen.value = false
  roomId.value = ''
  clearTimeout(leaveRoomTimer.value)
  toast.add({
    title: '对方拒绝了你的请求',
    color: 'error',
    icon: 'lucide:annoyed'
  })
}

const onDisconnect = () => {
  // 匹配时连接服务器失败提示
  if (matching.value) {
    offline.value = true
    toast.add({
      title: '连接服务器失败...',
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}

const onMatched = async data => {
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
    const { id } = userInfo.value
    localStorage.setItem(`matchType-${id}`, _matchType)
    localStorage.setItem(`matchRes-${id}`, JSON.stringify(_matchRes))
    matching.value = false

    // TODO: 处理匹配结果是好友的情况
    if (_matchType === 'voice-chat') {
      const _lastMsgMap = lastMsgMap.value
      const targetId = _matchRes.id
      await useAddLastMsg(_lastMsgMap, lastMsgList, matchRes, targetId)
      const db = await useGetDB(id)
      await db.put(
        'lastMessages',
        JSON.parse(JSON.stringify(_lastMsgMap[targetId]))
      )
    }

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
    color: 'error',
    icon: 'lucide:annoyed'
  })

  if (isVoiceChatMatch.value) {
    router.replace('/')
  }

  isVoiceChatModalOpen.value = false
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

const onRefreshContactNotifications = remoteNotifications => {
  const _contactNotifications = contactNotifications.value
  _contactNotifications.unshift(...remoteNotifications)
  localStorage.setItem(
    `contactNotifications-${userInfo.value.id}`,
    JSON.stringify(_contactNotifications)
  )
}

const onRefreshNotifications = remoteNotifications => {
  const _notifications = notifications.value
  _notifications.unshift(...remoteNotifications)
  localStorage.setItem('notifications', JSON.stringify(_notifications))
}

const onOnline = (type, res) => {
  const _lastMsgMap = lastMsgMap.value
  const _contactProfileMap = contactProfileMap.value
  const ids = Object.keys(res)

  if (type === 'messageList') {
    for (let i = 0, l = ids.length; i < l; i++) {
      const id = ids[i]
      _lastMsgMap[id].online = res[id]
    }
  } else if (type === 'contactList') {
    for (let i = 0, l = ids.length; i < l; i++) {
      const id = ids[i]
      _contactProfileMap[id].online = res[id]
    }
  } else if (type === 'matchTarget') {
    matchRes.value.online = res[ids[0]]
  }
}

const initWebRTC = id => {
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
  // 断开连接
  socket.on('disconnect', onDisconnect)
  // 匹配成功
  socket.on('matched', onMatched)
  // 对方结束了 web rtc
  socket.on('bye', onBye)
  // 好友申请通知
  socket.on('refresh-contact-notifications', onRefreshContactNotifications)
  // 其他通知
  socket.on('refresh-notifications', onRefreshNotifications)
  // 在线状态
  socket.on('online', onOnline)
}

const initLastMsgs = async () => {
  let _lastMsgMap: lastMsgMap = {}
  let _unreadMsgCounter = 0
  const db = await useGetDB(userInfo.value.id)
  const lastMsgs: lastMsg[] = (await db.getAll('lastMessages')).sort(
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

onMounted(() => {
  watch(
    id,
    async id => {
      if (id) {
        // 先获取本地数据库中的数据
        await initLastMsgs()
        // 拉取离线数据后，更新本地数据库中的数据和内存中的数据
        initWebRTC(id)
      } else {
        // 未登录或者登出
        const socket = globalSocket.value
        const pc = globalPC.value

        if (pc) {
          pc.close()
          globalPC.value = null
        }

        socket && socket.disconnect()
        globalSocket.value = null
      }
    },
    { immediate: true }
  )
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
