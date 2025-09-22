import { ref } from 'vue'
import { defineStore } from 'pinia'

const useWebRTCStore = defineStore('webRTCStore', () => ({
  roomId: ref(''),
  isVoiceChatMatch: ref(false), // 在双方语音匹配时建立了连接
  leaveRoomTimer: ref(null), // 规定时间内没能够建立连接，进行离开房间的定时器
  rtcConnected: ref(false), // RTC 已连接
  localAudioRef: ref<HTMLAudioElement | null>(null),
  remoteAudioRef: ref<HTMLAudioElement | null>(null),
  localMediaStream: ref<MediaStream | null>(null),
  isMicOpen: ref(localStorage.getItem('isMicOpen') === 'false' ? false : true),
  isSpeakerOpen: ref(
    localStorage.getItem('isSpeakerOpen') === 'false' ? false : true
  )
}))

export default useWebRTCStore
