const useRequestFullscreen = toast => {
  try {
    document.documentElement.requestFullscreen()
  } catch {
    toast.add({
      title: '进入全屏模式失败',
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}

export default useRequestFullscreen
