const useScrollToBottom = msgContainerRef => {
  const container = msgContainerRef.value
  const timer = setTimeout(() => {
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth'
    })
    clearTimeout(timer)
  })
}

export default useScrollToBottom
