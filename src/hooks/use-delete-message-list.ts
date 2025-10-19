import useClearMessageRecord from './use-clear-message-record'
import useHideMessageList from './use-hide-message-list'

const useDeleteMessageList = async (
  userInfo,
  targetId,
  unreadMsgCounter,
  indexMap,
  lastMsgList,
  lastMsgMap,
  messageList,
  _targetId,
  lastFetchedId,
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
    _targetId,
    isSlide,
    isMobile,
    emits
  )
  await useClearMessageRecord(
    userInfo,
    targetId,
    messageList,
    lastMsgMap,
    _targetId,
    lastFetchedId,
    false
  )
  // 不需要在这里重置 store 中的 targetId，因为上面函数的内部会重置
}

export default useDeleteMessageList
