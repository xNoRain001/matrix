import useClearMessageRecord from './use-clear-message-record'
import useHideMessageList from './use-hide-message-list'

const useDeleteMessageList = async (
  userInfo,
  targetId,
  unreadMsgCounter,
  indexMap,
  lastMsgList,
  lastMsgMap,
  messageRecordMap,
  activeTargetIds,
  isChatOpen,
  activeTargetId,
  activeTargetProfile,
  isSlide,
  isMobile,
  emits = null
) => {
  await useHideMessageList(
    userInfo,
    targetId,
    unreadMsgCounter,
    indexMap,
    lastMsgList,
    lastMsgMap,
    activeTargetIds,
    isChatOpen,
    activeTargetId,
    activeTargetProfile,
    isSlide,
    isMobile,
    emits
  )
  await useClearMessageRecord(
    userInfo,
    targetId,
    messageRecordMap,
    lastMsgMap,
    activeTargetIds,
    false
  )
  // 不需要在这里重置 store 中的 targetId，因为上面函数的内部会重置
}

export default useDeleteMessageList
