import HTTP from './http'

const prefix = '/oss'

export const getSignedURLAPI = async (type: 'msgs' | 'tmp', filename, size) =>
  HTTP.request(
    `${prefix}/pre-sign?type=${type}&filename=${filename}&size=${size}`
  )

export const updateStaticNameAPI = async (
  type: 'avatar' | 'spaceBg',
  filename
) =>
  HTTP.request(`${prefix}/update-static-name?type=${type}&filename=${filename}`)
