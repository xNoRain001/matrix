const useScrollToTop = () => {
  const html = document.documentElement
  html.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

export default useScrollToTop
