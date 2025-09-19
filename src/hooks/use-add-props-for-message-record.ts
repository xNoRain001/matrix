const genUUID = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })

const useAddPropsForMessageRecord = (messageRecord, label, url) => {
  // 不需要加 isImage 判断，因为就算是图片也依旧需要判断 url 是否有值，因此直接判断
  // url 是否有值
  if (url) {
    messageRecord.url = url
  }

  if (label) {
    label.id = genUUID()
  }

  messageRecord.id = genUUID()
}

export default useAddPropsForMessageRecord
