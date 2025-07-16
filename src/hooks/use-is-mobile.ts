const useIsMobile = () => {
  return /mobile|android|iphone|ipad|ipod|windows phone|phone|webos/i.test(
    navigator.userAgent.toLowerCase()
  )
}

export default useIsMobile
