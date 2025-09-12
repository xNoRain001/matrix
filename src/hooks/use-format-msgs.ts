import useGetDB from './use-get-db'

const useFormatMsgs = async (id, data, hashToBlobURLMap) => {
  const db = await useGetDB(id)
  const tx = db.transaction('files', 'readonly')
  const _hashToBlobURLMap = hashToBlobURLMap.value

  for (let i = 0, l = data.length; i < l; i++) {
    const item = data[i]
    const { type, hash } = item

    if (type === 'image') {
      if (_hashToBlobURLMap.has(hash)) {
        item.url = _hashToBlobURLMap.get(hash)
        continue
      }

      try {
        const record = await tx.objectStore('files').get(hash)
        const url = URL.createObjectURL(record.blob)
        item.url = url
        if (_hashToBlobURLMap.size < 100) {
          _hashToBlobURLMap.set(hash, url)
        }
      } catch {}
    }
  }

  await tx.done

  return data
}

export default useFormatMsgs
