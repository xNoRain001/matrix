import useInitLabelAndSeparator from './use-init-label-and-separator'
import useUUID from './use-uuid'
import useAddMessageRecordToView from './use-add-message-record-to-view'
import { uploadImage } from '@/apis/oss'
import useAddLastMsg from './use-add-last-msg'
import useAddMessageRecordToDB from './use-add-message-record-to-db'
import useUpdateLastMsg from './use-update-last-msg'
import type { message } from '@/types'

const addMsgToView = (
  isText,
  isImage,
  id,
  message,
  hash,
  width,
  height,
  url,
  duration,
  targetId,
  messageList,
  _lastMsgMap,
  msgContainerRef,
  inView
) => {
  const timestamp = Date.now()
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
    : isImage
      ? {
          type: 'image',
          hash,
          width,
          height,
          ...common
        }
      : {
          type: 'audio',
          hash,
          duration,
          ...common
        }
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

  return [indexdbLabel, indexdbMessageRecord, payload, messageRecord]
}

export const addMsgToDB = async (
  id,
  indexdbLabel,
  indexdbMessageRecord,
  isText,
  isImage,
  messageRecord,
  _lastMsgMap,
  duration,
  targetId,
  lastMsgList,
  matchRes,
  indexMap,
  unreadMsgCounter
) => {
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
        {
          ...messageRecord,
          content: isImage ? '[图片]' : `[语音] ${duration}''`
        },
    false,
    true,
    unreadMsgCounter
  )
}

export const sendMsg = async (
  file,
  hash,
  payload,
  isText,
  indexdbMessageRecord,
  messageRecord,
  _lastMsgMap,
  globalSocket,
  resend = false
) => {
  if (!isText) {
    try {
      const { data } = await uploadImage(file, hash)
      payload.ossURL = `${import.meta.env.VITE_OSS_BASE_URL}${data}`

      if (resend) {
        // 修改为当前时间
        payload.timestamp = Date.now()
        delete messageRecord.resendArgs
        delete messageRecord.error
        // 如果发送失败的状态保存在 db 中，这里还需要修改 db 中的 error
      }
    } catch {
      // 重新发送时需要这些信息，重新发送时发送失败不需要重复添加这些信息
      if (!resend) {
        messageRecord.resendArgs = [
          file,
          hash,
          payload,
          isText,
          indexdbMessageRecord,
          messageRecord,
          _lastMsgMap,
          globalSocket
        ]
        messageRecord.error = true
        // 发送失败的状态可以保存在 db 中，但是刷新后 resendArgs 就消失了，无法重新
        // 发送，这里不保存，刷新后发送失败的消息不会出现失败提示
        // indexdbMessageRecord.error = true
      }

      throw Error()
    }
  }

  globalSocket.value.emit('send-msg', JSON.stringify(payload))
}

const useSendMsg = async (
  type,
  message,
  hash,
  file,
  width,
  height,
  url,
  duration,
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
  const isImage = type === 'image'
  const { id } = userInfo.value
  const _lastMsgMap = lastMsgMap.value
  const [indexdbLabel, indexdbMessageRecord, payload, messageRecord] =
    addMsgToView(
      isText,
      isImage,
      id,
      message,
      hash,
      width,
      height,
      url,
      duration,
      targetId,
      messageList,
      _lastMsgMap,
      msgContainerRef,
      inView
    )
  try {
    await sendMsg(
      file,
      hash,
      payload,
      isText,
      indexdbMessageRecord,
      messageRecord,
      _lastMsgMap,
      globalSocket
    )
  } catch {
    throw Error()
  } finally {
    // 发送失败也保存到本地
    await addMsgToDB(
      id,
      indexdbLabel,
      indexdbMessageRecord,
      isText,
      isImage,
      messageRecord,
      _lastMsgMap,
      duration,
      targetId,
      lastMsgList,
      matchRes,
      indexMap,
      unreadMsgCounter
    )
  }
}

export default useSendMsg
