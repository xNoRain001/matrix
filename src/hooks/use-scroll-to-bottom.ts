const useScrollToBottom = elm => {
  const timer = setTimeout(() => {
    elm.scrollTo({
      top: elm.scrollHeight,
      behavior: 'smooth'
    })
    clearTimeout(timer)
  })
}

export default useScrollToBottom
