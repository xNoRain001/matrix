import HTTP from './http'

const prefix = '/report'

export const reportAPI = async data =>
  HTTP.request(`${prefix}`, {
    data,
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

export const adminGetReportsAPI = async () =>
  HTTP.request(`${prefix}/admin-get-reports`)
