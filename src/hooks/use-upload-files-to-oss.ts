import { getSignedURLAPI } from '@/apis/oss'
import useGenHash from './use-gen-hash'
import useNSFW from './use-nsfw'

const initPayloadSize = (newImageMetadata, imageMetadata) => {
  const promises = newImageMetadata.map(({ file, index }) => {
    return new Promise(resolve => {
      const img = new Image()
      img.onload = () => {
        const { width, height } = img
        imageMetadata[index].width = width
        imageMetadata[index].height = height
        resolve(null)
      }
      img.src = URL.createObjectURL(file)
    })
  })

  return Promise.all(promises)
}

const initPayloadURL = async (newImageMetadata, imageMetadata) => {
  const promises = newImageMetadata.map(({ file, index }) => {
    return new Promise((resolve, reject) => {
      useGenHash(file).then(hash => {
        const item = imageMetadata[index]
        item.hash = hash
        getSignedURLAPI('tmp', hash, file.size)
          .then(({ data }) => {
            item.url = data
            resolve(null)
          })
          .catch(() => reject())
      })
    })
  })

  return Promise.all(promises)
}

const startUplaod = (userInfo, newImageMetadata, imageMetadata) => {
  const promises = newImageMetadata.map(({ file, index }) => {
    return new Promise((resolve, reject) => {
      const item = imageMetadata[index]
      const { url, hash } = item
      const { id } = userInfo.value

      if (url.startsWith(`tmp/${id}/`)) {
        // oss 中已经存在该图片，不需要重复上传
        item.url = url
        delete item.hash
        resolve(null)
      } else {
        fetch(url, {
          method: 'PUT',
          body: file
        })
          .then(({ ok }) => {
            if (ok) {
              item.url = `tmp/${id}/${hash}`
              delete item.hash
              resolve(null)
            } else {
              reject()
            }
          })
          .catch(() => reject())
      }
    })
  })

  return Promise.all(promises)
}

const useUploadFilesToOSS = async (
  userInfo,
  fileType: 'image' | 'audio',
  files
) => {
  try {
    await useNSFW(files)
  } catch {
    throw new Error('操作失败，存在违规图片')
  }

  // 最终上传到服务器的内容
  const imageMetadata = []
  // 新添加的图片
  const newImageMetadata = []

  for (let i = 0, l = files.length; i < l; i++) {
    const file = files[i]
    const { ossURL, width, height } = file

    if (ossURL) {
      // 存在 ossURL，说明从本地数据库中读取的图片，file 此时是 Blob 类型，如果能进入
      // 到这里，一定是更新操作
      imageMetadata.push({ url: ossURL, width, height })
    } else {
      // 新图片，记录索引，之后根据索引更新对应的数据
      imageMetadata.push({} as any)
      newImageMetadata.push({
        file,
        index: i
      })
    }
  }

  try {
    if (fileType === 'image') {
      await initPayloadSize(newImageMetadata, imageMetadata)
    }
    await initPayloadURL(newImageMetadata, imageMetadata)
    await startUplaod(userInfo, newImageMetadata, imageMetadata)
    return imageMetadata
  } catch (error) {
    throw error
  }
}

export default useUploadFilesToOSS
