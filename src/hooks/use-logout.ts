import { useUserStore } from '@/store'

const useLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('contactList')
  localStorage.removeItem('contactListExpireAt')
  localStorage.removeItem('contactProfileMap')
  localStorage.removeItem('matchRes')
  localStorage.removeItem('matchType')
  localStorage.removeItem('matchType')
  localStorage.removeItem('profileMap')
  localStorage.removeItem('profileMapExpireAt')
  useUserStore().userInfo = null
}

export default useLogout
