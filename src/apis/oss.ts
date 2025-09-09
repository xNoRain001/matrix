import HTTP from './http'

const prefix = '/oss'

export const uploadImage = async (image, hash) => {
  const formdata = new FormData()
  formdata.append('hash', hash)
  formdata.append('file', image)

  return HTTP.request(`${prefix}/image`, {
    data: formdata,
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
