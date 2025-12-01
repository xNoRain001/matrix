import useGetDB from './use-get-db'

const useHideMessageList = async (
  userInfo,
  targetId,
  unreadMsgCounter,
  indexMap,
  lastMsgList,
  lastMsgMap,
  activeTargetIds,
  isChatOpen,
  activeTargetId,
  activeTargetNickname,
  isSlide,
  isMobile,
  emit = null
) => {
  const { id } = userInfo.value
  const db = await useGetDB(id)
  const transaction = db.transaction('lastMessages', 'readwrite')
  const store = transaction.objectStore('lastMessages')
  await store.delete(targetId)
  const _lastMsgList = lastMsgList.value
  const _indexMap = indexMap.value
  const _lastMsgMap = lastMsgMap.value
  const unreadMsgs = _lastMsgMap[targetId].unreadMsgs || 0
  const index = _indexMap[targetId]

  _lastMsgList.splice(index, 1)

  if (unreadMsgs) {
    unreadMsgCounter.value -= unreadMsgs
  }

  delete _lastMsgMap[targetId]
  delete _indexMap[targetId]

  for (let i = index, l = _lastMsgList.length; i < l; i++) {
    _indexMap[_lastMsgList[i]]--
  }

  if (!isSlide) {
    if (isMobile) {
      emit('close')
    } else if (activeTargetIds.value.has(targetId)) {
      // 通过右键菜单隐藏了当前聊天（此时 activeTargetIds 只有一项，因为只有一项时，
      // 才能操作聊天列表）
      isChatOpen.value = false
      activeTargetId.value = ''
      activeTargetNickname.value = ''
    }
  }
}

export default useHideMessageList
