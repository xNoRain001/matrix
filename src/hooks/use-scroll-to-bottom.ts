const useScrollToBottom = () => {
  const html = document.documentElement
  const timer = setTimeout(() => {
    html.scrollTo({
      top: html.scrollHeight,
      behavior: 'smooth'
    })
    clearTimeout(timer)
  })
}

export default useScrollToBottom
