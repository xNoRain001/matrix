import HTTP from './http'

const prefix = '/ys'

export const assistAPI = async data =>
  HTTP.request(`${prefix}/assist`, {
    method: 'POST',
    data
  })

export const helpAPI = async id => HTTP.request(`${prefix}/help?assistId=${id}`)

export const cancelAssistAPI = async avatar =>
  HTTP.request(`${prefix}/cancel-assist?avatar=${avatar}`)

export const getAssistsAPI = async (
  { avatar, createdAt },
  lastId = '',
  firstId = ''
) =>
  HTTP.request(
    `${prefix}/assists?avatar=${avatar}&createdAt=${createdAt}&lastId=${lastId}&firstId=${firstId}`
  )

export const getMyAssistsAPI = async () => HTTP.request(`${prefix}/my-assists`)

export const getAssistCountAPI = async () =>
  HTTP.request(`${prefix}/assist-count`)

export const getHelpCountAPI = async () => HTTP.request(`${prefix}/help-count`)
