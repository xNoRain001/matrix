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

export const getFeedbacksAPI = async () =>
  HTTP.request(`${prefix}/get-feedbacks`)

export const adminGetFeedbacksAPI = async () =>
  HTTP.request(`${prefix}/admin-get-feedbacks`)

export const adminReadFeedbackAPI = async (id, feedbackId) =>
  HTTP.request(
    `${prefix}/admin-read-feedback?id=${id}&feedbackId=${feedbackId}`
  )
