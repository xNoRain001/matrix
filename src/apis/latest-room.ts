import HTTP from './http'

const _path = '/latest-room'

export const getLatestRoom = async () => HTTP.request(_path)

export const updateLatestRoom = async (
  path: string = '',
  roomId: string = '',
  latestId: string = ''
) =>
  HTTP.request(_path, {
    method: 'POST',
    data: { path, roomId, latestId }
  })

export const isExitRoom = async latestId =>
  HTTP.request(`${_path}/is-exit-room?latestId=${latestId}`)
