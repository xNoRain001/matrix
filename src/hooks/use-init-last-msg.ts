import { getProfiles } from '@/apis/profile'

const useInitLastMsg = async (_lastMsgMap, lastMsgList, matchRes, id) => {
  if (!_lastMsgMap[id]) {
    const _matchRes = matchRes.value
    // _matchRes.id 和 id 相同，说明是这次匹配到的人，不需要发送请求
    const profileMap =
      _matchRes?.id === id
        ? { [id]: _matchRes.profile }
        : (await getProfiles(id)).data

    // TODO: 不需要保存 matchRes 中的 id 到 profile 中
    // profile 没有返回 id，需要手动补充
    _lastMsgMap[id] = { id, profile: { ...profileMap[id] } }
    lastMsgList.value.unshift(id)
  }
}

export default useInitLastMsg
