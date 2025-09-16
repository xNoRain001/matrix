import useInitLabelAndSeparator from './use-init-label-and-separator'
import useUUID from './use-uuid'
import useAddMessageRecordToView from './use-add-message-record-to-view'
import { uploadImage } from '@/apis/oss'
import useAddLastMsg from './use-add-last-msg'
import useAddMessageRecordToDB from './use-add-message-record-to-db'
import useUpdateLastMsg from './use-update-last-msg'
import type { message } from '@/types'

const useSendMsg = async (
  type,
  message,
  hash,
  file,
  width,
  height,
  url,
  targetId,
  userInfo,
  globalSocket,
  messageList,
  lastMsgList,
  lastMsgMap,
  matchRes,
  indexMap,
  unreadMsgCounter,
  msgContainerRef,
  inView
) => {
  const isText = type === 'text'
  const timestamp = Date.now()
  const { id } = userInfo.value
  const common = {
    contact: id,
    sender: id,
    receiver: targetId,
    timestamp
  }
  const payload: message = isText
    ? {
        type: 'text',
        content: message,
        ...common
      }
    : {
        type: 'image',
        hash,
        width,
        height,
        ...common
      }
  const _lastMsgMap = lastMsgMap.value
  const common2 = { sent: true, contact: targetId }
  const messageRecord = isText
    ? {
        ...payload,
        ...common2
      }
    : {
        url,
        ...payload,
        ...common2
      }
  const label = useInitLabelAndSeparator(messageRecord, _lastMsgMap, targetId)
  const indexdbLabel = label ? { ...label } : null
  const indexdbMessageRecord = isText
    ? { ...messageRecord }
    : // 本地数据库中不需要保存临时的 url
      { ...messageRecord, url: '' }

  if (label) {
    label.id = useUUID()
  }

  messageRecord.id = useUUID()

  if (inView) {
    useAddMessageRecordToView(label, messageRecord, messageList)
    ;(msgContainerRef.value as any).scrollToBottom()
  }

  if (!isText) {
    const { data } = await uploadImage(file, hash)
    payload.ossURL = `${import.meta.env.VITE_OSS_BASE_URL}${data}`
  }

  globalSocket.value.emit('send-msg', JSON.stringify(payload))
  await useAddLastMsg(_lastMsgMap, lastMsgList, matchRes, targetId)
  await useAddMessageRecordToDB(id, indexdbLabel, indexdbMessageRecord)
  useUpdateLastMsg(
    id,
    indexMap,
    lastMsgList,
    _lastMsgMap,
    isText
      ? messageRecord
      : // messageRecord 被保存到了内存中，因此不能修改它
        { ...messageRecord, content: '[图片]' },
    false,
    true,
    unreadMsgCounter
  )
}

export default useSendMsg
