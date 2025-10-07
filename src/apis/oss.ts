import HTTP from './http'

const prefix = '/oss'

export const getSignedURLAPI = async (
  type: 'posts' | 'comment' | 'reply' | 'avatar' | 'spaceBg' | 'msgs' | 'tmp',
  filename,
  size
) =>
  HTTP.request(
    `${prefix}/pre-sign?type=${type}&filename=${filename}&size=${size}`
  )
