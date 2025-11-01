import HTTP from './http'

const prefix = '/admin'

export const adminGetFeedbacksAPI = async () =>
  HTTP.request(`${prefix}/get-feedbacks`)

export const adminReadFeedbackAPI = async (id, feedbackId) =>
  HTTP.request(`${prefix}/read-feedback?id=${id}&feedbackId=${feedbackId}`)

export const adminGetReportsAPI = async () =>
  HTTP.request(`${prefix}/get-reports`)

export const adminReadReportAPI = async id =>
  HTTP.request(`${prefix}/read-report?id=${id}`)

export const adminResetProfileAPI = async (
  reportId,
  type,
  reportedUserId,
  postId,
  commentId
) =>
  HTTP.request(
    `${prefix}/reset-profile?reportId=${reportId}&type=${type}&reportedUserId=${reportedUserId}&postId=${postId}&commentId=${commentId}`
  )
