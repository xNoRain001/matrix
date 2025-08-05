import { defineStore } from 'pinia'

const useDeviceInfoStore = defineStore('deviceInfoStore', () => {
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )

  return { isMobile }
})

export default useDeviceInfoStore
