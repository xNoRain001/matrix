import { getProfiles } from '@/apis/profile'

const useAddLastMsg = async (lastMsgMap, lastMsgList, matchRes, id) => {
  const _lastMsgMap = lastMsgMap.value

  if (!_lastMsgMap[id]) {
    const _matchRes = matchRes.value
    // _matchRes.id === id 说明是这次匹配到的人
    const profileMap =
      _matchRes.id === id ? { [id]: _matchRes } : (await getProfiles(id)).data

    _lastMsgMap[id] = { ...profileMap[id] }
    lastMsgList.value.unshift(id)
    localStorage.setItem('profileMap', JSON.stringify(_lastMsgMap))
  }
}

export default useAddLastMsg
