import HTTP from './http'

const prefix = '/oss'

const getFormdate = (hash, image) => {
  const formdata = new FormData()
  formdata.append('hash', hash)
  formdata.append('file', image)
  return formdata
}

export const uploadImage = async (image, hash) =>
  HTTP.request(`${prefix}/image`, {
    data: getFormdate(hash, image),
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

export const updateSpaceBg = async (image, hash) =>
  HTTP.request(`${prefix}/update-space-bg`, {
    data: getFormdate(hash, image),
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

export const updateAvatar = async (image, hash) =>
  HTTP.request(`${prefix}/update-avatar`, {
    data: getFormdate(hash, image),
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
