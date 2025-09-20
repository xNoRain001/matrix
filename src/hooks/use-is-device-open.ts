const useIsDeviceOpen = async (toast, deviceName, deviceNameZh) => {
  if (navigator.permissions?.query) {
    try {
      const { state } = await navigator.permissions.query({ name: deviceName })

      if (state !== 'granted') {
        toast.add({
          title: `未开启${deviceNameZh}权限`,
          color: 'error',
          icon: 'lucide:annoyed'
        })

        return false
      }

      return true
    } catch {
      toast.add({
        title: `检测${deviceNameZh}权限时发生错误`,
        color: 'error',
        icon: 'lucide:annoyed'
      })

      return false
    }
  }

  // 兼容性处理
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    // 检测到有开启麦克风的权限后关闭麦克风
    stream.getTracks().forEach(track => track.stop())
    return true
  } catch (err) {
    const title =
      err.name === 'NotAllowedError'
        ? `未开启${deviceNameZh}权限`
        : err.name === 'NotFoundError'
          ? `未检测到${deviceNameZh}设备`
          : `检测${deviceNameZh}权限时发生错误`
    toast.add({
      title: title,
      color: 'error',
      icon: 'lucide:annoyed'
    })

    return false
  }
}

export default useIsDeviceOpen
