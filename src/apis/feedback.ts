import HTTP from './http'

const prefix = '/feedback'

export const postFeedback = async data =>
  HTTP.request(`${prefix}`, {
    method: 'POST',
    data: { content: data }
  })

export const adminGetFeedbacks = async () =>
  HTTP.request(`${prefix}/admin-get-feedbacks`)
