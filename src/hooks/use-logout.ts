import { useUserInfoStore } from '@/store'

const useLogout = () => {
  localStorage.removeItem('token')
  useUserInfoStore().userInfo = null
}

export default useLogout
