import useGetDB from './use-get-db'

const useHideMessageList = async (
  userInfo,
  targetId,
  unreadMsgCounter,
  indexMap,
  lastMsgList,
  lastMsgMap,
  _targetId
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

  // 如果不相等，说明当前在聊天界面中，通过右键菜单隐藏了其他人的列表，因此不需要关闭
  // 当前的聊天界面
  if (_targetId.value === targetId) {
    _targetId.value = ''
  }
}

export default useHideMessageList
