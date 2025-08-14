const useScrollToBottom = elm => {
  elm = elm.value

  const timer = setTimeout(() => {
    elm.scrollTo({
      top: elm.scrollHeight,
      behavior: 'smooth'
    })
    clearTimeout(timer)
  })
}

export default useScrollToBottom
