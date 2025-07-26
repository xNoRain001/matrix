import hasVerification from './has-verification-code'
import getPublicKey from './get-public-key'
import isExistedUser from './is-existed-user'
import register from './register'
import validateVerificationCode from './validate-verification-code'
import updateProfile from './update-profile'
import login from './login'
import getUserInfo from './get-user-info'
import sendVerificationCodeToEmail from './send-verification-code-to-email'
import updatePassword from './update-password'
import getLatestRoom from './get-latest-room'
import setLatestRoom from './set-latest-room'
import clearLatestRoom from './clear-latest-room'
import isExitRoom from './is-exit-room'

export {
  isExitRoom,
  clearLatestRoom,
  setLatestRoom,
  getLatestRoom,
  updatePassword,
  sendVerificationCodeToEmail,
  getUserInfo,
  login,
  updateProfile,
  isExistedUser,
  hasVerification,
  getPublicKey,
  register,
  validateVerificationCode
}
