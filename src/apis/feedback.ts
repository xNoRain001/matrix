import HTTP from './http'

const prefix = '/feedback'

export const postFeedback = async data =>
  HTTP.request(`${prefix}`, {
    data,
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

export const adminGetFeedbacks = async () =>
  HTTP.request(`${prefix}/admin-get-feedbacks`)
