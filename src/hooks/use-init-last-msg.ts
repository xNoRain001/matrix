import { refreshNickname } from '@/apis/profile'

const useInitLastMsg = async (_lastMsgMap, lastMsgList, matchRes, id) => {
  if (!_lastMsgMap[id]) {
    const _matchRes = matchRes.value
    // 相同，说明是这次匹配到的人，不需要发送请求
    const isMatch = _matchRes?.targetId === id
    const nickname = isMatch
      ? _matchRes.targetNickname
      : (await refreshNickname(id)).data[id]

    // 需要存储 id，因为会定期更新 nickname，id 是 indexDB 中的 key
    _lastMsgMap[id] = { id, profile: { nickname } }
    lastMsgList.value.unshift(id)
  }
}

export default useInitLastMsg
