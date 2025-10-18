const useExitFullscreen = toast => {
  try {
    document.exitFullscreen()
  } catch {
    toast.add({
      title: '退出全屏模式失败',
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}

export default useExitFullscreen
