const useInitAutoScrollBtn = (
  scrollTop,
  isMobile,
  footerNavs,
  nav,
  isAutoScrollBtnShow
) => {
  const _isMobile = isMobile.value
  const isPlayground = nav === 'playground'

  if (scrollTop > 400) {
    if (_isMobile) {
      if (isPlayground) {
        footerNavs.value[1].label = '顶部'
        footerNavs.value[1].icon = 'lucide:rocket'
      } else {
        footerNavs.value[4].label = '顶部'
        footerNavs.value[4].icon = 'lucide:rocket'
      }
    } else {
      isAutoScrollBtnShow.value = true
    }
  } else {
    if (_isMobile) {
      if (isPlayground) {
        footerNavs.value[1].label = '广场'
        footerNavs.value[1].icon = 'lucide:rose'
      } else {
        footerNavs.value[4].label = '我的'
        footerNavs.value[4].icon = 'lucide:user-round-cog'
      }
    } else {
      isAutoScrollBtnShow.value = false
    }
  }
}

export default useInitAutoScrollBtn
