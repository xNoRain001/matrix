import useInitLabelAndSeparator from './use-init-label-and-separator'
import useAddMessageRecordToView from './use-add-message-record-to-view'
import { getSignedURLAPI } from '@/apis/oss'
import useInitLastMsg from './use-init-last-msg'
import useAddMessageRecordToDB from './use-add-message-record-to-db'
import useUpdateLastMsgToView from './use-update-last-msg-to-view'
import type { message } from '@/types'
import useUpdateLastMsgToDB from './use-update-last-msg-to-db'
import useInitIndexedDBData from './use-init-indexed-db-data'
import useAddPropsForMessageRecord from './use-add-props-for-message-record'

const addMsgToView = (
  type,
  isNotMedia,
  isImage,
  id,
  message,
  hash,
  width,
  height,
  url,
  duration,
  targetId,
  messageRecordMap,
  _lastMsgMap,
  inView
) => {
  const timestamp = Date.now()
  const common = {
    contact: id,
    sender: id,
    receiver: targetId,
    timestamp
  }
  const payload = isNotMedia
    ? {
        type,
        content: message, // TODO: tip 是没有 content 内容的，可以不添加该字段
        ...common
      }
    : isImage
      ? {
          type: 'image' as const,
          hash,
          width,
          height,
          ...common
        }
      : {
          type: 'audio' as const,
          hash,
          duration,
          ...common
        }
  const common2 = { sent: true, contact: targetId }
  const messageRecord: message = {
    ...payload,
    ...common2
  }

  const label = useInitLabelAndSeparator(messageRecord, _lastMsgMap, targetId)
  const [indexdbLabel, indexdbMessageRecord] = useInitIndexedDBData(
    label,
    messageRecord
  )
  useAddPropsForMessageRecord(messageRecord, label, url)
  useAddMessageRecordToView(
    inView,
    label,
    messageRecord,
    messageRecordMap,
    targetId
  )

  // 为了防止伪造其他人的消息，需要在服务器中提供这两个字段
  delete payload.sender
  delete payload.contact
  return [indexdbLabel, indexdbMessageRecord, payload, messageRecord]
}

export const sendMsg = async (
  file,
  hash,
  payload,
  isNotMedia,
  indexdbMessageRecord,
  messageRecord,
  _lastMsgMap,
  globalSocket,
  userInfo,
  resend = false
) => {
  if (!isNotMedia) {
    try {
      const { data: signedURL } = await getSignedURLAPI('msgs', hash, file.size)
      const ossURL = `msgs/${userInfo.value.id}/${hash}`
      const ok =
        // 说明 oss 存在该图片，TODO: 极小概率，马上就要失效，对方收到后，无法获取图片
        signedURL === ossURL
          ? true
          : (
              await fetch(signedURL, {
                method: 'PUT',
                body: file
              })
            ).ok

      if (ok) {
        payload.ossURL = ossURL

        if (resend) {
          // 修改为当前时间
          payload.timestamp = Date.now()
          delete messageRecord.resendArgs
          delete messageRecord.error
          // 如果发送失败的状态保存在 db 中，这里还需要修改 db 中的 error
        }
      } else {
        throw Error()
      }
    } catch {
      // 重新发送时需要这些信息，重新发送时发送失败不需要重复添加这些信息
      if (!resend) {
        messageRecord.resendArgs = [
          file,
          hash,
          payload,
          isNotMedia,
          indexdbMessageRecord,
          messageRecord,
          _lastMsgMap,
          globalSocket,
          userInfo
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
  messageRecordMap,
  lastMsgList,
  lastMsgMap,
  matchRes,
  indexMap,
  unreadMsgCounter,
  inView
) => {
  const isNotMedia = type !== 'image' && type !== 'audio'
  const isImage = type === 'image'
  const { id } = userInfo.value
  const _lastMsgMap = lastMsgMap.value
  // 优先在视图中显示消息
  const [indexdbLabel, indexdbMessageRecord, payload, messageRecord] =
    addMsgToView(
      type,
      isNotMedia,
      isImage,
      id,
      message,
      hash,
      width,
      height,
      url,
      duration,
      targetId,
      messageRecordMap,
      _lastMsgMap,
      inView
    )
  // 初始化消息列表
  await useInitLastMsg(_lastMsgMap, lastMsgList, matchRes, targetId)
  // 更新视图中最后一条消息记录
  const item = useUpdateLastMsgToView(
    indexMap,
    lastMsgList,
    _lastMsgMap,
    isNotMedia
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
  try {
    // 发送消息
    await sendMsg(
      file,
      hash,
      payload,
      isNotMedia,
      indexdbMessageRecord,
      messageRecord,
      _lastMsgMap,
      globalSocket,
      userInfo
    )
  } catch {
    throw Error()
  } finally {
    // 保存消息和最后一条消息到本地数据库，发送失败也保存
    await useAddMessageRecordToDB(id, indexdbLabel, indexdbMessageRecord)
    await useUpdateLastMsgToDB(id, item)
  }
}

export default useSendMsg
