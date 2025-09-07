import { getProfiles } from '@/apis/profile'

const useAddLastMsg = async (_lastMsgMap, lastMsgList, matchRes, id) => {
  if (!_lastMsgMap[id]) {
    const _matchRes = matchRes.value
    // _matchRes.id 和 id 相同，说明是这次匹配到的人，不需要发送请求
    const profileMap =
      _matchRes?.id === id ? { [id]: _matchRes } : (await getProfiles(id)).data

    _lastMsgMap[id] = { ...profileMap[id] }
    lastMsgList.value.unshift(id)
    localStorage.setItem('profileMap', JSON.stringify(_lastMsgMap))
  }
}

export default useAddLastMsg
