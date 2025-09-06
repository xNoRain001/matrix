const fiveMins = 5 * 1000 * 60

const useIsOverFiveMins = (messageRecord, _lastMsgMap, id) =>
  messageRecord.timestamp - (_lastMsgMap[id]?.timestamp || 0) > fiveMins

export default useIsOverFiveMins
