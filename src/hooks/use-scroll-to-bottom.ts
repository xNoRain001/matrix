const useScrollToBottom = elm => {
  const parent = elm.value.parentNode
  const timer = setTimeout(() => {
    parent.scrollTo({
      top: parent.scrollHeight,
      behavior: 'smooth'
    })
    clearTimeout(timer)
  })
}

export default useScrollToBottom
